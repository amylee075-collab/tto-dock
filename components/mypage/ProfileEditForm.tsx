"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";

const ORANGE = "#ff5700";
const NICKNAME_PATTERN = /^[A-Za-z0-9가-힣]+$/;

interface ProfileResponse {
  profile: {
    nickname: string;
    email: string;
    provider: string;
    emailLocked: boolean;
    canChangePassword: boolean;
  };
}

interface ProfileFormValues {
  nickname: string;
  password: string;
  confirmPassword: string;
}

type NicknameStatus = "idle" | "checking" | "available" | "duplicate" | "invalid";

export default function ProfileEditForm() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>("idle");
  const [profileMeta, setProfileMeta] = useState<ProfileResponse["profile"] | null>(null);
  const [initialValues, setInitialValues] = useState<{ nickname: string; email: string }>({
    nickname: "",
    email: "",
  });

  const {
    register,
    watch,
    reset,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<ProfileFormValues>({
    mode: "onChange",
    defaultValues: {
      nickname: "",
      password: "",
      confirmPassword: "",
    },
  });

  const nicknameValue = watch("nickname");
  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");
  const passwordsMatch = !passwordValue || passwordValue === confirmPasswordValue;

  useEffect(() => {
    let alive = true;
    const fallbackName =
      typeof session?.user?.name === "string" && session.user.name.trim() ? session.user.name.trim() : "";
    const fallbackEmail =
      typeof session?.user?.email === "string" && session.user.email.trim() ? session.user.email.trim() : "";

    const loadProfile = async () => {
      setLoading(true);
      setSubmitError("");

      try {
        const res = await fetch("/api/mypage/profile", { cache: "no-store" });
        const json = (await res.json()) as ProfileResponse | { error?: string };

        if (!res.ok || !("profile" in json)) {
          throw new Error("프로필 정보를 불러오지 못했어요.");
        }

        if (!alive) return;

        const nextNickname = json.profile.nickname || fallbackName;
        const nextEmail = json.profile.email || fallbackEmail;
        setProfileMeta(json.profile);
        setInitialValues({ nickname: nextNickname, email: nextEmail });
        reset({
          nickname: nextNickname,
          password: "",
          confirmPassword: "",
        });
        setNicknameStatus(nextNickname ? "available" : "idle");
      } catch (error) {
        if (!alive) return;
        const fallbackProfile = {
          nickname: fallbackName,
          email: fallbackEmail,
          provider: "credentials",
          emailLocked: true,
          canChangePassword: true,
        };
        setProfileMeta((prev) => prev ?? fallbackProfile);
        setInitialValues({ nickname: fallbackName, email: fallbackEmail });
        reset({
          nickname: fallbackName,
          password: "",
          confirmPassword: "",
        });
        setNicknameStatus(fallbackName ? "available" : "idle");
      } finally {
        if (alive) setLoading(false);
      }
    };

    void loadProfile();

    return () => {
      alive = false;
    };
  }, [reset, session?.user?.email, session?.user?.name]);

  useEffect(() => {
    if (!profileMeta) return;

    const nickname = nicknameValue?.trim() ?? "";
    if (!nickname) {
      setNicknameStatus("idle");
      return;
    }

    if (!NICKNAME_PATTERN.test(nickname)) {
      setNicknameStatus("invalid");
      return;
    }

    if (nickname === initialValues.nickname) {
      setNicknameStatus("available");
      return;
    }

    const controller = new AbortController();
    setNicknameStatus("checking");

    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/mypage/profile?nickname=${encodeURIComponent(nickname)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const json = (await res.json()) as { available?: boolean };
        if (!res.ok) {
          setNicknameStatus("invalid");
          return;
        }
        setNicknameStatus(json.available ? "available" : "duplicate");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setNicknameStatus("invalid");
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [initialValues.nickname, nicknameValue, profileMeta]);

  const nicknameMessage = useMemo(() => {
    switch (nicknameStatus) {
      case "checking":
        return { text: "별명 중복 여부를 확인하고 있어요.", color: "text-gray-500" };
      case "available":
        return nicknameValue?.trim()
          ? { text: "사용 가능한 별명이에요.", color: "text-emerald-600" }
          : null;
      case "duplicate":
        return { text: "이미 사용 중인 별명이에요.", color: "text-[#ff5700]" };
      case "invalid":
        return { text: "별명은 한글, 영어, 숫자만 사용할 수 있어요.", color: "text-[#ff5700]" };
      default:
        return null;
    }
  }, [nicknameStatus, nicknameValue]);

  const confirmMessage = useMemo(() => {
    if (!profileMeta?.canChangePassword || (!passwordValue && !confirmPasswordValue)) {
      return null;
    }

    if (!confirmPasswordValue) {
      return { text: "비밀번호 확인을 입력해 주세요.", color: "text-gray-500" };
    }

    if (passwordsMatch) {
      return { text: "비밀번호가 일치해요.", color: "text-emerald-600" };
    }

    return { text: "비밀번호가 일치하지 않아요.", color: "text-[#ff5700]" };
  }, [confirmPasswordValue, passwordValue, passwordsMatch, profileMeta?.canChangePassword]);

  const submitEnabled =
    isDirty &&
    isValid &&
    nicknameStatus === "available" &&
    passwordsMatch &&
    !submitting &&
    !loading;
  const currentNickname = nicknameValue?.trim() || profileMeta?.nickname || session?.user?.name || "학습자";
  const providerLabel = profileMeta?.provider === "google" ? "구글 소셜 로그인" : "이메일 로그인";

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setSubmitError("");
    setSaveMessage("");

    try {
      const res = await fetch("/api/mypage/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: values.nickname.trim(),
          password: values.password,
        }),
      });
      const json = (await res.json()) as ProfileResponse | { error?: string };

      if (!res.ok || !("profile" in json)) {
        throw new Error(("error" in json && json.error) || "수정에 실패했어요.");
      }

      setProfileMeta(json.profile);
      setInitialValues({ nickname: json.profile.nickname, email: json.profile.email });
      reset({
        nickname: json.profile.nickname,
        password: "",
        confirmPassword: "",
      });
      setNicknameStatus("available");
      setSaveMessage("내 정보가 저장되었어요.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "수정에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  });

  if (loading) {
    return (
      <div className="py-8 font-pretendard">
        <div className="space-y-8">
          <div className="animate-pulse rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-8">
            <div className="h-5 w-24 rounded bg-gray-100" />
            <div className="mt-4 h-8 w-40 rounded bg-gray-100" />
            <div className="mt-8 space-y-4">
              <div className="h-24 rounded-2xl bg-gray-100" />
              <div className="h-24 rounded-2xl bg-gray-100" />
              <div className="h-24 rounded-2xl bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 font-pretendard">
      <div className="space-y-8">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[15px] font-semibold text-[#F97316]">마이페이지</p>
              <h1 className="mt-2 text-3xl font-extrabold text-[#212529]">내 정보 수정</h1>
              <p className="mt-3 text-[15px] font-medium leading-7 text-gray-600">
                별명과 비밀번호를 현재 로그인 방식에 맞게 간단하게 관리할 수 있어요.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-[15px] font-semibold text-gray-500">현재 별명</p>
                  <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#212529]">{currentNickname}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-[15px] font-semibold text-gray-500">로그인 방식</p>
                  <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#212529]">{providerLabel}</p>
                </div>
              </div>
            </div>
            <Link
              href="/mypage/info"
              className="inline-flex items-center justify-center rounded-full border border-[#F97316]/20 px-5 py-3 text-[15px] font-bold text-[#F97316] transition-colors hover:bg-[#FFF1E8]"
            >
              마이페이지로 돌아가기
            </Link>
          </div>
        </section>

        <form onSubmit={onSubmit} className="space-y-6">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-8">
            <div>
              <p className="text-[15px] font-semibold text-[#F97316]">기본 정보</p>
              <h2 className="mt-1 text-xl font-extrabold text-[#212529]">별명과 이메일 확인</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 md:gap-6">
              <div className="rounded-2xl bg-gray-50 p-5">
                <label htmlFor="nickname" className="block text-[15px] font-bold text-[#212529]">
                  별명
                </label>
                <input
                  id="nickname"
                  type="text"
                  autoComplete="nickname"
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] font-semibold text-[#212529] outline-none transition focus:border-[#ff5700] focus:ring-2 focus:ring-[#ff5700]/15"
                  placeholder="한글, 영어, 숫자만 가능"
                  {...register("nickname", {
                    required: "별명을 입력해 주세요.",
                    pattern: {
                      value: NICKNAME_PATTERN,
                      message: "별명은 한글, 영어, 숫자만 사용할 수 있어요.",
                    },
                    minLength: {
                      value: 1,
                      message: "별명을 1자 이상 입력해 주세요.",
                    },
                  })}
                />
                {errors.nickname ? (
                  <p className="mt-2 text-[15px] font-medium text-[#ff5700]">{errors.nickname.message}</p>
                ) : nicknameMessage ? (
                  <p className={`mt-2 text-[15px] font-medium ${nicknameMessage.color}`}>{nicknameMessage.text}</p>
                ) : null}
              </div>

              <div className="rounded-2xl bg-gray-50 p-5">
                <label className="block text-[15px] font-bold text-[#212529]">
                  이메일
                </label>
                <div className="mt-2 rounded-2xl bg-white px-4 py-3">
                  <p className="break-all text-[15px] font-semibold leading-7 text-[#212529]">
                    {profileMeta?.email || session?.user?.email || "이메일 정보가 없어요."}
                  </p>
                </div>
                <p className="mt-2 text-[15px] font-medium text-gray-500">이메일은 수정할 수 없어요.</p>
              </div>
            </div>
          </section>

          {profileMeta?.canChangePassword ? (
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-8">
              <div>
                <p className="text-[15px] font-semibold text-[#F97316]">비밀번호 변경</p>
                <h2 className="mt-1 text-xl font-extrabold text-[#212529]">안전하게 새 비밀번호 설정</h2>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2 md:gap-6">
                <div className="rounded-2xl bg-gray-50 p-5">
                  <label htmlFor="password" className="block text-[15px] font-bold text-[#212529]">
                    새 비밀번호
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] font-semibold text-[#212529] outline-none transition focus:border-[#ff5700] focus:ring-2 focus:ring-[#ff5700]/15"
                    placeholder="변경하지 않으려면 비워두세요"
                    {...register("password", {
                      validate: (value) =>
                        !value || value.length >= 8 || "비밀번호는 8자 이상이어야 합니다.",
                    })}
                  />
                  {errors.password && (
                    <p className="mt-2 text-[15px] font-medium text-[#ff5700]">{errors.password.message}</p>
                  )}
                </div>

                <div className="rounded-2xl bg-gray-50 p-5">
                  <label htmlFor="confirmPassword" className="block text-[15px] font-bold text-[#212529]">
                    새 비밀번호 확인
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] font-semibold text-[#212529] outline-none transition focus:border-[#ff5700] focus:ring-2 focus:ring-[#ff5700]/15"
                    placeholder="한 번 더 입력해 주세요"
                    {...register("confirmPassword", {
                      validate: (value) =>
                        !passwordValue || value === passwordValue || "비밀번호가 일치하지 않아요.",
                    })}
                  />
                  {errors.confirmPassword ? (
                    <p className="mt-2 text-[15px] font-medium text-[#ff5700]">
                      {errors.confirmPassword.message}
                    </p>
                  ) : confirmMessage ? (
                    <p className={`mt-2 text-[15px] font-medium ${confirmMessage.color}`}>{confirmMessage.text}</p>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {(submitError || saveMessage) && (
            <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              {submitError ? (
                <p className="text-[15px] font-medium text-[#ff5700]">{submitError}</p>
              ) : (
                <p className="text-[15px] font-medium text-emerald-600">{saveMessage}</p>
              )}
            </section>
          )}

          <div className="flex flex-col gap-3 md:flex-row md:justify-end">
            <button
              type="submit"
              disabled={!submitEnabled}
              className="inline-flex items-center justify-center rounded-full px-6 py-3 text-[15px] font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:bg-gray-300 md:min-w-[140px]"
              style={{ backgroundColor: submitEnabled ? ORANGE : undefined }}
            >
              {submitting ? "수정 중..." : "수정하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
