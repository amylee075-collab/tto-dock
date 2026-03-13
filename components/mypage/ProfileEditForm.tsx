"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";

const ORANGE = "#ff5700";
/** 공백 제외 1~10자 (문자 종류는 서버에서 한 번 더 검증) */
const NICKNAME_PATTERN = /^[^\s]{1,10}$/;

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

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}

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

  /** 검사용: 공백 제거 후 1~10자 */
  const normalizedNickname = (nicknameValue ?? "").replace(/\s/g, "").trim();

  useEffect(() => {
    if (!profileMeta) return;

    if (!normalizedNickname) {
      setNicknameStatus("idle");
      return;
    }

    if (normalizedNickname.length === 0 || normalizedNickname.length > 10) {
      setNicknameStatus("invalid");
      return;
    }

    if (normalizedNickname === initialValues.nickname.replace(/\s/g, "").trim()) {
      setNicknameStatus("available");
      return;
    }

    const controller = new AbortController();
    setNicknameStatus("checking");

    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/mypage/profile?nickname=${encodeURIComponent(normalizedNickname)}`, {
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
  }, [initialValues.nickname, normalizedNickname, profileMeta]);

  const nicknameMessage = useMemo(() => {
    switch (nicknameStatus) {
      case "checking":
        return { text: "별명 중복 여부를 확인하고 있어요.", color: "text-gray-500" };
      case "available":
        return normalizedNickname
          ? { text: "사용 가능한 별명이에요.", color: "text-emerald-600" }
          : null;
      case "duplicate":
        return { text: "이미 사용 중인 별명이에요.", color: "text-[#ff5700]" };
      case "invalid":
        return { text: "별명은 한글, 영어, 숫자만 1~10자로 입력해 주세요.", color: "text-[#ff5700]" };
      default:
        return null;
    }
  }, [nicknameStatus, normalizedNickname]);

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
    passwordsMatch &&
    !submitting &&
    !loading &&
    nicknameStatus !== "duplicate" &&
    nicknameStatus !== "invalid";

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setSubmitError("");
    setSaveMessage("");

    try {
      const nicknameToSave = (values.nickname ?? "").replace(/\s/g, "").trim();
      const res = await fetch("/api/mypage/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nicknameToSave,
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
      <div className="py-8 font-pretendard flex justify-center">
        <div className="w-full max-w-md animate-pulse rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="h-5 w-24 rounded bg-gray-100" />
          <div className="mt-4 h-12 w-full rounded-2xl bg-gray-100" />
          <div className="mt-6 h-12 w-full rounded-2xl bg-gray-100" />
          <div className="mt-6 h-12 w-full rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 font-pretendard flex justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-center text-2xl md:text-3xl font-extrabold text-[#212529]">내 정보 수정</h1>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* 별명 수정 */}
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center gap-2">
              <label htmlFor="nickname" className="text-[15px] font-bold text-[#212529]">
                별명 수정
              </label>
              <PencilIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="nickname"
              type="text"
              autoComplete="nickname"
              className="mt-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-[15px] font-medium text-[#212529] outline-none transition placeholder:text-gray-400 focus:border-[#ff5700] focus:ring-2 focus:ring-[#ff5700]/15"
              placeholder="한글, 영어, 숫자 1~10자"
              {...register("nickname", {
                required: "별명을 입력해 주세요.",
                validate: (v) => {
                  const t = (v ?? "").replace(/\s/g, "").trim();
                  if (t.length === 0) return "별명을 입력해 주세요.";
                  if (t.length > 10) return "별명은 10자 이내로 입력해 주세요.";
                  return NICKNAME_PATTERN.test(t) || "공백 없이 1~10자로 입력해 주세요.";
                },
              })}
            />
            {errors.nickname ? (
              <p className="mt-2 text-sm font-medium text-[#ff5700]">{errors.nickname.message}</p>
            ) : nicknameMessage ? (
              <p className={`mt-2 text-sm font-medium ${nicknameMessage.color}`}>{nicknameMessage.text}</p>
            ) : null}
          </section>

          {/* 비밀번호 변경 — 이메일 로그인일 때만 */}
          {profileMeta?.canChangePassword ? (
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-[15px] font-bold text-[#212529]">비밀번호 변경</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                    새 비밀번호
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-[15px] font-medium text-[#212529] outline-none transition placeholder:text-gray-400 focus:border-[#ff5700] focus:ring-2 focus:ring-[#ff5700]/15"
                    placeholder="변경하지 않으려면 비워두세요"
                    {...register("password", {
                      validate: (value) =>
                        !value || value.length >= 8 || "비밀번호는 8자 이상이에요.",
                    })}
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-sm font-medium text-[#ff5700]">{errors.password.message}</p>
                  )}
                </div>
                <div className="md:col-span-1">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600">
                    새 비밀번호 확인
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-[15px] font-medium text-[#212529] outline-none transition placeholder:text-gray-400 focus:border-[#ff5700] focus:ring-2 focus:ring-[#ff5700]/15"
                    placeholder="한 번 더 입력해 주세요"
                    {...register("confirmPassword", {
                      validate: (value) =>
                        !passwordValue || value === passwordValue || "비밀번호가 일치하지 않아요.",
                    })}
                  />
                  {errors.confirmPassword ? (
                    <p className="mt-1.5 text-sm font-medium text-[#ff5700]">
                      {errors.confirmPassword.message}
                    </p>
                  ) : confirmMessage ? (
                    <p className={`mt-1.5 text-sm font-medium ${confirmMessage.color}`}>{confirmMessage.text}</p>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {(submitError || saveMessage) && (
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              {submitError ? (
                <p className="text-sm font-medium text-[#ff5700]">{submitError}</p>
              ) : (
                <p className="text-sm font-medium text-emerald-600">{saveMessage}</p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!submitEnabled}
              className="flex-1 rounded-xl py-3 text-[15px] font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: submitEnabled ? ORANGE : "#9ca3af" }}
            >
              {submitting ? "저장 중..." : "수정 완료"}
            </button>
            <Link
              href="/mypage/info"
              className="flex flex-1 items-center justify-center rounded-xl border border-gray-300 py-3 text-[15px] font-bold text-gray-700 transition-colors hover:bg-gray-50"
            >
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
