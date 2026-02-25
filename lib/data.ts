/**
 * 또독 2.0 - 활동별·분야별 지문 및 오늘의 단어 데이터
 */

export type ContentType = "CORE_WORD" | "SHORT" | "LONG" | "DIGITAL";

export interface Quiz {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface ReadingContent {
  id: string;
  type: ContentType;
  title: string;
  sentences: string[];
  /** CORE_WORD용: 클릭 가능한 후보군. coreWord는 반드시 이 배열에 포함된 요소와 일치해야 함 */
  selectableWords?: string[];
  coreWord?: string; // 핵심 단어 (selectableWords 중 하나와 동일)
  summaryStep?: {
    original: string;
    removal: string[]; // 삭제할 예시/반복 어구
    final: string; // 최종 요약문
  };
  quizzes?: Quiz[];
  vocabulary?: {
    word: string;
    meaning: string;
    type: "순우리말" | "한자어" | "외래어";
  }[];
}

export const ttodockData: ReadingContent[] = [
  {
    id: "step-1",
    type: "CORE_WORD",
    title: "핵심 단어 찾기 연습",
    sentences: [
      "공동체 의식이란, 모든 사람이 서로 도우며 한 식구처럼 아끼고 서로를 사랑하는 마음을 말한다.",
    ],
    selectableWords: ["공동체 의식", "식구", "사랑", "마음", "도우며"],
    coreWord: "공동체 의식",
    summaryStep: {
      original:
        "공동체 의식이란, 모든 사람이 서로 도우며 한 식구처럼 아끼고 서로를 사랑하는 마음을 말한다.",
      removal: ["한 식구처럼", "서로를"],
      final:
        "공동체 의식이란, 모든 사람이 서로 도우며 아끼고 사랑하는 마음이다.",
    },
  },
  {
    id: "step-2",
    type: "SHORT",
    title: "이솝우화: 개미와 베짱이",
    sentences: [
      "무더운 여름날, 개미들은 땀을 흘리며 열심히 먹이를 모았어요.",
      "그 모습을 본 베짱이는 나무 그늘 아래서 노래만 불렀답니다.",
      "추운 겨울이 오자 베짱이는 배가 고파 개미를 찾아갔어요.",
    ],
    coreWord: "근면함",
    vocabulary: [
      { word: "근면함", meaning: "꾸준히 열심히 하는 태도", type: "한자어" },
    ],
    quizzes: [
      {
        question: "베짱이가 겨울에 배가 고팠던 이유는 무엇인가요?",
        options: [
          "잠을 자서",
          "노래만 부르고 대비하지 않아서",
          "길을 잃어서",
        ],
        answer: "노래만 부르고 대비하지 않아서",
        explanation: "미래를 위해 미리 준비하는 태도가 중요합니다.",
      },
    ],
  },
  {
    id: "long-1",
    type: "LONG",
    title: "공동체와 협동",
    sentences: [
      "공동체란 함께 사는 사람들이 서로 의지하고 돕는 삶의 터전을 말한다. 옛날부터 사람들은 혼자보다 함께 살면서 위험을 나누고 기쁨을 나눴다.",
      "협동은 여러 사람이 한 가지 일을 위해 힘을 모으는 것을 뜻한다. 농사짓기, 집을 짓는 일, 마을 일을 할 때도 협동이 필요했다.",
      "오늘날에도 학교에서 조별 과제를 하거나, 동네에서 이웃과 나눔 활동을 할 때 협동이 이루어진다. 공동체 의식이란 모든 사람이 서로 도우며 한 식구처럼 아끼고 사랑하는 마음을 말한다.",
      "이런 마음이 있으면 우리 동네와 사회가 더욱 따뜻해진다.",
    ],
    vocabulary: [
      { word: "공동체", meaning: "함께 사는 삶의 터전", type: "한자어" },
      { word: "협동", meaning: "함께 힘을 모아 일함", type: "한자어" },
      { word: "의지", meaning: "믿고 기대함", type: "한자어" },
    ],
    quizzes: [
      {
        question: "공동체란 무엇인가요?",
        options: [
          "혼자 사는 곳",
          "함께 사는 사람들이 서로 돕는 삶의 터전",
          "학교만 가리키는 말",
        ],
        answer: "함께 사는 사람들이 서로 돕는 삶의 터전",
        explanation: "공동체는 함께 살며 서로 의지하고 돕는 곳입니다.",
      },
      {
        question: "협동이 필요한 경우가 아닌 것은?",
        options: ["조별 과제", "혼자 책 읽기", "이웃 나눔 활동"],
        answer: "혼자 책 읽기",
        explanation: "협동은 여러 사람이 힘을 모을 때 필요합니다.",
      },
      {
        question: "공동체 의식으로 적절한 것은?",
        options: [
          "나만 잘 되면 된다",
          "서로 도우며 아끼고 사랑하는 마음",
          "경쟁만 하는 것",
        ],
        answer: "서로 도우며 아끼고 사랑하는 마음",
        explanation: "공동체 의식은 함께 아끼고 사랑하는 마음입니다.",
      },
    ],
  },
];

export const getContentById = (id: string): ReadingContent | undefined =>
  ttodockData.find((c) => c.id === id);

/** CORE_WORD 타입 콘텐츠 중 첫 번째 (핵심 단어 찾기 / 단계별 요약용) */
export const getFirstCoreWordContent = (): ReadingContent | undefined =>
  ttodockData.find((c) => c.type === "CORE_WORD");

// --- 기존 활동/분야별 구조 (호환용) ---

export type PassageCategory = "science" | "history" | "society" | "news";
export type TodayActivityType = "summary" | "short" | "long";

export interface ReadingPassage {
  id: string;
  title: string;
  type: "literature" | "nonfiction";
  summary: string;
  sentences: string[];
  difficulty: "easy" | "medium";
  /** 분야별 글 읽기용 */
  category?: PassageCategory;
  /** 뉴스 기사 여부 */
  isNews?: boolean;
  /** 오늘의 학습용: 문단 요약 / 짧은 글 / 긴 글 */
  activityType?: TodayActivityType;
}

/** 오늘의 단어 퀴즈 (일일 어휘) */
export interface DailyWordQuiz {
  word: string;
  meaning: string;
  example: string;
}

/** 일일 어휘 퀴즈 샘플 (실제로는 날짜별 로테이션) */
export const dailyWordQuiz: DailyWordQuiz = {
  word: "꾸준히",
  meaning: "잠시도 쉬지 않고 계속",
  example: "꾸준히 연습하면 실력이 늘어요.",
};

export const readingPassages: ReadingPassage[] = [
  {
    id: "passage-1",
    title: "토끼와 거북이",
    type: "literature",
    summary: "천천히 꾸준히 가는 사람이 이긴다는 이야기입니다.",
    difficulty: "easy",
    sentences: [
      "옛날 옛적에 토끼와 거북이가 살았습니다.",
      "토끼는 달리기를 아주 잘했고, 거북이는 걸음이 느렸습니다.",
      "어느 날 토끼가 거북이에게 달리기 시합을 제안했습니다.",
      "거북이는 고개를 끄덕이며 시합을 받아들였습니다.",
      "시합이 시작되자 토끼는 금방 앞서 나갔습니다.",
      "토끼는 거북이가 너무 느리다고 생각하고 나무 아래에서 잠을 잤습니다.",
      "거북이는 쉬지 않고 한 걸음 한 걸음 앞으로 걸었습니다.",
      "토끼가 잠에서 깨어났을 때, 거북이는 이미 결승선을 넘었습니다.",
      "꾸준히 노력하는 사람이 결국 이긴다는 것을 우리는 이 이야기에서 배웁니다.",
    ],
    activityType: "long",
  },
  {
    id: "passage-2",
    title: "나무의 사계절",
    type: "nonfiction",
    summary: "봄, 여름, 가을, 겨울에 나무가 어떻게 변하는지 알아봅니다.",
    difficulty: "easy",
    sentences: [
      "나무는 사계절마다 다른 모습을 보여 줍니다.",
      "봄이 되면 나무에 새 잎이 돋아나고 꽃이 핍니다.",
      "여름에는 잎이 무성해져서 그늘을 만들어 줍니다.",
      "가을이 오면 잎이 노랗고 빨갛게 물들어 떨어집니다.",
      "겨울에는 잎이 모두 떨어지고 나뭇가지만 남습니다.",
      "나무는 추운 겨울을 견디며 봄을 기다립니다.",
      "이렇게 나무는 한 해를 보내고, 또 새로운 봄을 맞이합니다.",
    ],
    category: "science",
    activityType: "short",
  },
  {
    id: "passage-3",
    title: "물의 여행",
    type: "nonfiction",
    summary: "바다의 물이 증발하고 비가 되어 다시 돌아오는 과정을 배웁니다.",
    difficulty: "medium",
    sentences: [
      "바다와 강, 호수에 있는 물은 햇빛을 받으면 수증기가 됩니다.",
      "수증기는 가벼워서 하늘로 올라가 구름을 만듭니다.",
      "구름이 많이 모이면 무거워져서 비나 눈이 내립니다.",
      "비와 눈은 땅에 떨어져 다시 강과 바다로 흘러갑니다.",
      "이렇게 물은 끊임없이 순환합니다.",
      "우리가 마시는 물도 예전에는 바다에 있던 물일 수 있습니다.",
      "물의 순환 덕분에 지구의 모든 생명이 살아갈 수 있습니다.",
    ],
    category: "science",
    activityType: "short",
  },
  {
    id: "passage-4",
    title: "효도한 까치",
    type: "literature",
    summary: "어미를 잘 모시는 까치의 이야기입니다.",
    difficulty: "medium",
    sentences: [
      "까치는 참새보다 조금 큰 새로, 검은색과 흰색 깃을 가지고 있습니다.",
      "옛날 이야기에 까치가 늙은 어미를 위해 먹이를 날라 드린다고 합니다.",
      "어미 까치가 늙어서 스스로 먹이를 구하지 못하게 되었습니다.",
      "자식 까치들은 번갈아 가며 어미에게 먹이를 물어다 주었습니다.",
      "사람들은 이 모습을 보고 효도의 본받을 만하다고 말했습니다.",
      "동물에게서도 부모를 존중하고 돌보는 마음을 찾을 수 있습니다.",
    ],
    category: "history",
    activityType: "summary",
  },
  {
    id: "passage-5",
    title: "지구와 달",
    type: "nonfiction",
    summary: "지구와 달의 관계와 달의 모양이 바뀌는 이유를 알아봅니다.",
    difficulty: "easy",
    sentences: [
      "달은 지구를 돌며 함께 태양을 돌고 있습니다.",
      "달은 스스로 빛을 내지 못하고 태양 빛을 받아 반짝입니다.",
      "그래서 지구에서 보면 달의 모양이 조금씩 달라 보입니다.",
      "초승달, 보름달, 그믐달은 모두 같은 달을 다른 각도에서 본 모습입니다.",
    ],
    category: "science",
  },
  {
    id: "passage-6",
    title: "세종대왕과 한글",
    type: "nonfiction",
    summary: "세종대왕이 한글을 만든 이유와 과정을 알아봅니다.",
    difficulty: "medium",
    sentences: [
      "세종대왕은 백성들이 글을 쉽게 배울 수 있도록 한글을 만들었습니다.",
      "그 전에는 한자를 쓰려면 오래 공부해야 했습니다.",
      "세종대왕은 여러 학자와 함께 소리 나는 대로 적을 수 있는 글자를 만들었습니다.",
      "한글은 오늘날에도 우리가 쓰는 가장 소중한 글자입니다.",
    ],
    category: "history",
  },
  {
    id: "passage-7",
    title: "우리 동네 시설",
    type: "nonfiction",
    summary: "동네에 있는 다양한 시설과 그 역할을 알아봅니다.",
    difficulty: "easy",
    sentences: [
      "우리 동네에는 학교, 도서관, 우체국, 병원이 있습니다.",
      "도서관에서는 책을 빌리거나 읽을 수 있습니다.",
      "우체국에서는 편지를 부치거나 소포를 보낼 수 있습니다.",
      "병원에서는 아플 때 치료를 받습니다.",
    ],
    category: "society",
  },
  {
    id: "news-1",
    title: "어린이 독서 캠프 참가자 모집",
    type: "nonfiction",
    summary: "방학을 이용한 독서 캠프 안내 기사입니다.",
    difficulty: "easy",
    sentences: [
      "시립도서관이 방학 동안 어린이 독서 캠프를 연다.",
      "캠프에서는 그림책 읽기, 낭독 회, 독후감 쓰기 활동이 진행된다.",
      "참가를 원하는 어린이는 다음 달 1일까지 도서관 홈페이지에서 신청하면 된다.",
      "선착순 30명이며, 참가비는 무료다.",
    ],
    isNews: true,
  },
  {
    id: "news-2",
    title: "학교 운동회, 날씨 좋은 가을로 연기",
    type: "nonfiction",
    summary: "학교 운동회 연기 관련 짧은 뉴스입니다.",
    difficulty: "easy",
    sentences: [
      "○○초등학교가 예정됐던 운동회를 다음 주로 미뤘다.",
      "교장 선생님은 \"비 예보가 있어 안전을 위해 연기하기로 했다\"고 말했다.",
      "학부모들에게는 문자로 연기 안내가 나갈 예정이다.",
    ],
    isNews: true,
  },
];

export const getPassageById = (id: string): ReadingPassage | undefined =>
  readingPassages.find((p) => p.id === id);

/** 오늘의 학습: 문단 요약 / 짧은 글 / 긴 글에 쓸 지문 1개씩 */
export function getTodayPassages(): {
  summary: ReadingPassage;
  short: ReadingPassage;
  long: ReadingPassage;
} {
  const summary = readingPassages.find((p) => p.activityType === "summary")!;
  const short = readingPassages.find((p) => p.activityType === "short")!;
  const long = readingPassages.find((p) => p.activityType === "long")!;
  return { summary, short, long };
}

/** 분야별 글 읽기 - 과학/역사/사회 랜덤 1편 */
export function getRandomPassageByCategory(
  category: "science" | "history" | "society"
): ReadingPassage {
  const list = readingPassages.filter(
    (p) => p.category === category && !p.isNews
  );
  return list[Math.floor(Math.random() * list.length)] ?? readingPassages[0];
}

/** 디지털 문해력 - 뉴스 기사 랜덤 1편 */
export function getRandomNewsPassage(): ReadingPassage {
  const list = readingPassages.filter((p) => p.isNews);
  return list[Math.floor(Math.random() * list.length)] ?? readingPassages[0];
}

/** 문장의 단어 수 (띄어쓰기 단위, WPM 계산용) */
export function getWordCount(sentence: string): number {
  return sentence
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/** 0번 ~ activeIndex 문장까지의 총 단어 수 (공백 기준). WPM 실시간 합산용 */
export function getWordsCountUntilActiveIndex(
  sentences: string[],
  activeIndex: number | null
): number {
  if (!sentences.length || activeIndex === null || activeIndex < 0) return 0;
  const end = Math.min(activeIndex, sentences.length - 1);
  let total = 0;
  for (let i = 0; i <= end; i++) {
    total += getWordCount(sentences[i]);
  }
  return total;
}

// --- 짧은 이야기 (동화/전래동화) ---

export interface ShortStoryVocabulary {
  word: string;
  meaning: string;
  example: string;
}

export interface ShortStoryCoreQuiz {
  question: string;
  answer: string;
}

export interface ShortStoryReadQuiz {
  q: string;
  options: string[];
  ans: number; // 정답 인덱스 (0-based)
}

export interface ShortStory {
  id: string;
  title: string;
  thumbnail: string;
  content: string;
  vocabulary: ShortStoryVocabulary[];
  coreQuiz: ShortStoryCoreQuiz;
  readQuizzes: ShortStoryReadQuiz[];
  /** 홈/목록 카드용 뱃지 (예: ["과학"], ["쉬움], ["짧은 글"]) */
  badges?: string[];
  /** 분야별용: 과학 | 역사 | 사회 */
  section?: "과학" | "역사" | "사회";
  /** 디지털 문해력용: 신문기사 | 미디어 비판 등 */
  format?: string;
}

/** 짧은 글: 여우 누이, 토끼와 호랑이, 임금님 귀는 당나귀 귀 */
export const shortStories: ShortStory[] = [
  {
    id: "fox-sister",
    title: "여우 누이",
    thumbnail: "/images/fox_thumb.png",
    content: `옛날 어느 마을에 아들만 셋 있는 부부가 살았어요. 부부의 소원은 예쁜 딸을 하나 갖는 것이었지요. 간절히 빌고 빌어 마침내 예쁜 딸이 태어났는데, 어찌나 귀여운지 온 가족의 사랑을 독차지했답니다.

그런데 딸이 자라면서 이상한 일이 벌어졌어요. 밤마다 외양간의 소들이 한 마리씩 죽어 나가는 거예요. 아버지는 첫째 아들에게 밤을 지키라고 했어요. 첫째는 밤에 누이동생이 살금살금 기어 나와 소의 간을 빼 먹는 것을 보았지요. 하지만 아버지는 "귀한 내 딸이 그럴 리 없다!"라며 첫째를 내쫓았어요. 둘째 아들도 똑같은 말을 했다가 쫓겨나고 말았지요.

마지막까지 남았던 셋째 아들도 누이의 비밀을 알게 되었고, 먼 길을 떠나 훌륭한 스님을 만났어요. 스님은 셋째에게 위급할 때 던지라며 하얀색, 파란색, 빨간색 세 가지 보물 호리병을 주었지요.

시간이 흘러 고향이 그리워진 셋째가 집에 돌아오니, 마을은 폐허가 되어 있었어요. 집에는 누이동생 혼자뿐이었지요. 누이는 셋째를 보자마자 입맛을 다시며 달려들었어요. 사실 누이는 사람의 모습으로 변신한 '천 년 묵은 여우'였던 거예요!

셋째는 말을 타고 도망치기 시작했어요. 여우가 바짝 쫓아오자 셋째는 먼저 하얀 호리병을 던졌어요. 그러자 가시덤불이 솟아나 여우의 발을 붙잡았지요. 여우가 가시덤불을 뚫고 다시 쫓아오자 이번엔 파란 호리병을 던졌어요. 그러자 순식간에 깊고 넓은 바다가 생겨 여우를 가로막았어요.

마지막으로 여우가 바다를 건너 거의 다 따라왔을 때, 셋째는 빨간 호리병을 던졌어요. 그러자 시뻘건 불바다가 일어나 여우를 휩쓸어 버렸답니다. 덕분에 셋째 아들은 무사히 살아남을 수 있었어요.`,
    vocabulary: [
      { word: "소원", meaning: "바라고 원하는 일.", example: "부부의 간절한 소원은 예쁜 딸을 얻는 것이었다." },
      { word: "독차지", meaning: "혼자서 모두 다 가짐.", example: "막내딸은 온 가족의 사랑을 독차지하며 자랐다." },
      { word: "이상한", meaning: "보통과 다르고 별나다.", example: "밤마다 소가 죽어 나가는 이상한 일이 생겼다." },
      { word: "살금살금", meaning: "남이 모르게 발소리를 죽여 조심스럽게 걷는 모양.", example: "누이동생은 밤에 살금살금 외양간으로 향했다." },
      { word: "내쫓았어요", meaning: "억지로 밖으로 나가게 하다.", example: "아버지는 딸을 모함한다고 생각하여 아들을 내쫓았다." },
      { word: "위급할", meaning: "상황이 몹시 급하고 위험하다.", example: "스님은 위급한 때에 호리병을 던지라고 말씀하셨다." },
      { word: "폐허", meaning: "건물 등이 무너져 거칠게 변한 곳.", example: "오랫동안 비어있던 마을은 폐허가 되어 있었다." },
      { word: "변신한", meaning: "몸의 모양을 다른 것으로 바꿈.", example: "누이동생은 사실 사람으로 변신한 여우였다." },
      { word: "가시덤불", meaning: "가시나무가 어지럽게 엉킨 숲.", example: "하얀 호리병을 던지자 커다란 가시덤불이 생겨났다." },
      { word: "순식간", meaning: "눈을 한 번 깜빡하거나 숨을 한 번 쉴 정도의 아주 짧은 시간.", example: "순식간에 바다가 생겨 여우가 쫓아오지 못하게 막았다." },
    ],
    coreQuiz: {
      question: "셋째 아들이 스님에게 받은 보물로, 위급한 순간에 던져서 여우를 막아냈던 병의 이름은 무엇일까요?",
      answer: "호리병",
    },
    readQuizzes: [
      { q: "누이동생의 정체가 사실은 '여우'라는 것을 가장 먼저 알게 된 사람은 누구인가요?", options: ["아버지", "어머니", "첫째 아들", "셋째 아들"], ans: 2 },
      { q: "셋째 아들이 '파란 호리병'을 던졌을 때 나타난 것은 무엇인가요?", options: ["가시덤불", "넓은 바다", "뜨거운 불바다", "높은 바위산"], ans: 1 },
      { q: "이 이야기의 교훈으로 가장 알맞은 것은 무엇인가요?", options: ["겉모습만 보고 모든 것을 판단해서는 안 된다.", "형제끼리는 항상 사과를 나누어 먹어야 한다.", "집을 떠나면 반드시 스님을 만나야 한다.", "소를 키울 때는 외양간 문을 잘 잠가야 한다."], ans: 0 },
    ],
  },
  {
    id: "rabbit-tiger",
    title: "토끼와 호랑이",
    thumbnail: "/images/rabbit_tiger_thumb.png",
    content: `옛날 깊은 산속에 배가 몹시 고픈 호랑이가 살고 있었어요. 호랑이는 산길을 가던 토끼를 한입에 꿀꺽 잡아먹으려 했지요. 겁에 질린 토끼는 머리를 써서 꾀를 냈어요.

"아이구, 호랑이님! 저를 잡아먹는 것보다 훨씬 맛있는 '구운 떡'을 드시는 게 어때요? 제가 지금 막 떡을 구우려던 참이었거든요."

호랑이는 떡이라는 말에 침을 흘리며 좋아했어요. 토끼는 산 밑에서 반들반들한 돌멩이 열 개를 주워 모아 불을 피운 뒤 그 위에 올렸어요. 그리고는 "떡이 빨갛게 익을 동안 제가 꿀을 가져올게요. 절대 미리 세어 보지 마세요!"라고 말하고는 도망쳐 버렸지요. 호랑이는 떡이 열 개인 줄도 모르고 숫자를 세다가, 빨갛게 달궈진 돌멩이를 한입에 넣었다가 입안을 홀랑 데고 말았답니다.

겨울이 되자 화가 난 호랑이가 다시 토끼를 찾아냈어요. 이번에도 토끼는 천연덕스럽게 말했지요.
"호랑이님, 이번에는 꼬리만 담그면 물고기가 줄줄이 딸려 올라오는 강물 낚시를 가르쳐 드릴게요!"

호랑이는 토끼 말대로 꽁꽁 얼어붙은 강물 구멍에 꼬리를 담그고 밤새 기다렸어요. 하지만 물고기는커녕 강물이 꽁꽁 얼어붙어 호랑이의 꼬리는 얼음 속에 꽉 갇히고 말았지요.

마지막으로 봄이 되자 호랑이는 또 토끼를 만났어요. 토끼는 억새풀이 우거진 들판에서 말했어요.
"호랑이님, 저기 하늘을 보세요! 맛있는 참새 떼가 내려오고 있어요. 입을 크게 벌리고 기다리시면 제가 몰아다 드릴게요."

호랑이가 입을 벌리고 기다리자, 토끼는 들판에 불을 질렀어요. "타닥타닥" 풀 타는 소리를 참새들이 파닥거리는 소리로 착각한 호랑이는 결국 눈썹이 다 타버리고 나서야 토끼에게 또 속았다는 것을 알게 되었답니다.`,
    vocabulary: [
      { word: "꾀", meaning: "일을 잘 해결하거나 남을 속이기 위한 좋은 생각.", example: "토끼는 위기를 넘기기 위해 영리한 꾀를 냈습니다." },
      { word: "달궈진", meaning: "쇠나 돌 따위를 불에 넣어서 뜨겁게 만들다.", example: "토끼는 돌멩이를 불에 빨갛게 달궈서 호랑이를 속였습니다." },
      { word: "천연덕스럽게", meaning: "마음속으로는 거짓을 꾸미면서 겉으로는 아무렇지 않은 듯하다.", example: "토끼는 거짓말을 하면서도 천연덕스럽게 행동했습니다." },
      { word: "당황", meaning: "놀라거나 급해서 어찌할 바를 모르다.", example: "호랑이는 꼬리가 얼음에 붙자 몹시 당황했습니다." },
      { word: "착각한", meaning: "사물의 실제 모습과 다르게 생각하거나 잘못 알다.", example: "호랑이는 풀이 타는 소리를 참새 소리로 착각했습니다." },
      { word: "우거진", meaning: "풀이나 나무가 아주 무성하게 자라나다.", example: "토끼는 풀이 우거진 들판으로 호랑이를 데려갔습니다." },
      { word: "허겁지겁", meaning: "매우 급하거나 서두르는 모양.", example: "배가 고픈 호랑이는 허겁지겁 돌멩이를 먹으려 했습니다." },
      { word: "단단히", meaning: "아주 굳거나 튼튼하게, 또는 마음을 굳게 먹고.", example: "호랑이는 이번에야말로 토끼를 잡겠다고 단단히 마음먹었습니다." },
      { word: "도망쳐", meaning: "피하거나 숨기 위해 멀리 달아남.", example: "호랑이가 방심한 틈을 타서 토끼는 산 너머로 도망쳤습니다." },
      { word: "방심", meaning: "마음을 놓아 긴장을 풀거나 주의를 기울이지 않다.", example: "호랑이가 방심하는 사이에 토끼는 꾀를 생각해 냈습니다." },
    ],
    coreQuiz: {
      question: "무서운 호랑이를 상대로 위기를 벗어나기 위해 토끼가 낸 영리한 생각이나 수단을 무엇이라고 하나요?",
      answer: "꾀",
    },
    readQuizzes: [
      { q: "토끼가 뜨거운 돌멩이를 무엇이라고 속여서 호랑이에게 먹게 했나요?", options: ["맛있는 구운 떡", "달콤한 꿀단지", "바삭한 과자", "시원한 수박"], ans: 0 },
      { q: "호랑이가 강물에 꼬리를 담그고 밤새 기다린 이유는 무엇인가요?", options: ["꼬리를 깨끗하게 씻기 위해서", "강물을 모두 마셔 버리기 위해서", "물고기를 많이 잡기 위해서", "수영을 배우기 위해서"], ans: 2 },
      { q: "마지막 장면에서 호랑이가 '타닥타닥' 풀 타는 소리를 무엇으로 잘못 알았나요?", options: ["토끼가 도망가는 발소리", "맛있는 참새들의 날갯짓 소리", "하늘에서 비가 내리는 소리", "친구 호랑이가 부르는 소리"], ans: 1 },
    ],
  },
  {
    id: "king-ears",
    title: "임금님 귀는 당나귀 귀",
    thumbnail: "/images/king_ears_thumb.png",
    content: `옛날 어느 나라에 무엇이든 마음대로 하는 임금님이 살고 있었어요. 그런데 어느 날 자고 일어나 보니 임금님의 귀가 당나귀 귀처럼 길쭉하게 변해 있었지요. 임금님은 이 사실이 부끄러워 커다란 복건으로 귀를 꽁꽁 감추었어요.

이 비밀을 아는 사람은 임금님의 모자를 만드는 복건장 한 명뿐이었어요. 임금님은 복건장에게 "누구에게라도 이 사실을 말하면 엄벌을 내리겠다!"라고 무섭게 명령했어요. 복건장은 평생 비밀을 지키려 애썼지만, 입이 간지러워 병이 날 지경이었지요.

참다못한 복건장은 아무도 없는 대나무 숲으로 달려갔어요. 그리고는 구덩이를 깊게 파고 그 속에 머리를 박은 채 시원하게 외쳤어요. "임금님 귀는 당나귀 귀! 우리 임금님 귀는 당나귀 귀!" 속이 후련해진 복건장은 얼마 뒤 세상을 떠났어요.

그 뒤로 신기한 일이 벌어졌어요. 대나무 숲에 바람이 불 때마다 대나무들이 서로 몸을 부딪치며 소리를 내는 거예요. "임금님 귀는 당나귀 귀~" 소문은 바람을 타고 온 나라에 퍼졌고, 결국 모든 백성이 비밀을 알게 되었어요. 임금님은 처음에는 화가 났지만, 이미 알려진 사실을 어쩌겠어요? 임금님은 결국 복건을 벗어 던지고 백성들에게 긴 귀를 당당하게 보여 주었답니다.`,
    vocabulary: [
      { word: "비밀", meaning: "남에게 드러내거나 알리지 말아야 할 일.", example: "복건장은 임금님의 귀가 길다는 비밀을 지켜야 했다." },
      { word: "복건", meaning: "옛날에 남자들이 머리에 쓰던 건.", example: "임금님은 길어진 귀를 감추기 위해 커다란 복건을 썼다." },
      { word: "엄벌", meaning: "엄한 벌.", example: "임금님은 비밀을 누설하면 엄벌을 내리겠다고 위협했다." },
      { word: "명령", meaning: "윗사람이 아랫사람에게 무엇을 시킴.", example: "임금님의 명령 때문에 복건장은 아무 말도 할 수 없었다." },
      { word: "누설", meaning: "비밀이 밖으로 새 나가게 하다.", example: "복건장은 비밀을 누설하고 싶은 마음을 꾹 참았다." },
      { word: "후련해진", meaning: "답답하던 마음이 풀려 시원하고 가볍다.", example: "대나무 숲에서 소리를 지르고 나니 속이 후련했다." },
      { word: "지경", meaning: "어떤 형편이나 상태.", example: "비밀을 말하지 못해 병이 날 지경에 이르렀다." },
      { word: "당당하게", meaning: "모습이나 태도가 자신 있고 떳떳하다.", example: "임금님은 나중에 자신의 귀를 당당하게 드러냈다." },
      { word: "부끄러워", meaning: "남을 보기에 창피하거나 스스로 떳떳하지 못하다.", example: "임금님은 당나귀 귀가 된 것이 처음엔 부끄러웠다." },
      { word: "신기한", meaning: "믿기 어려울 만큼 기묘하고 이상하다.", example: "대나무 숲에서 목소리가 흘러나오는 신기한 일이 생겼다." },
    ],
    coreQuiz: {
      question: "복건장이 임금님의 비밀을 외쳤던 장소이자, 바람이 불 때마다 소리가 울려 퍼졌던 이곳은 어디일까요?",
      answer: "대나무 숲",
    },
    readQuizzes: [
      { q: "임금님이 자신의 귀를 감추기 위해 머리에 썼던 것은 무엇인가요?", options: ["왕관", "복건", "수건", "투구"], ans: 1 },
      { q: "복건장이 대나무 숲 구덩이에 대고 외친 말은 무엇인가요?", options: ["임금님은 욕심쟁이", "임금님은 멋쟁이", "임금님 귀는 소머리 귀", "임금님 귀는 당나귀 귀"], ans: 3 },
      { q: "이야기의 마지막에 임금님은 어떤 결정을 내렸나요?", options: ["복건장을 다시 불러 벌을 주었다.", "대나무 숲을 모두 베어 버렸다.", "비밀을 당당하게 밝히고 귀를 보여 주었다.", "더 큰 복건을 만들어 귀를 꽁꽁 숨겼다."], ans: 2 },
    ],
  },
];

/** 긴 글: 아낌없이 주는 나무, 동물 농장, 양반전 */
export const longStories: ShortStory[] = [
  {
    id: "giving-tree",
    title: "아낌없이 주는 나무 (Shel Silverstein)",
    thumbnail: "/images/giving_tree.png",
    content: `옛날 어느 곳에 커다란 나무 한 그루가 있었습니다. 그리고 그 나무에게는 자신이 무척 사랑하는 소년이 한 명 있었습니다. 소년은 매일 나무를 찾아와 떨어지는 나뭇잎을 모아 왕관을 만들어 쓰고 숲속의 왕이 되어 놀았습니다. 나무줄기를 타고 올라가 가지에 매달려 그네도 타고, 달콤한 사과도 따 먹었지요. 소년과 나무는 숨바꼭질을 하며 행복한 시간을 보냈고, 소년이 지치면 나무는 기꺼이 자신의 그늘을 내어주어 낮잠을 자게 했습니다. 소년은 나무를 진심으로 사랑했고, 나무는 더할 나위 없이 행복했습니다.

하지만 세월이 흘러 소년이 나이를 먹으면서 나무는 홀로 있는 시간이 많아졌습니다. 어느 날, 청년이 되어 돌아온 소년에게 나무는 예전처럼 함께 놀자고 제안했습니다. 그러나 소년은 "난 이제 놀기에는 너무 커버렸어. 사고 싶은 게 많아서 돈이 필요해."라고 말했습니다. 나무는 "나에겐 돈이 없지만, 내 사과를 모두 따다가 시장에 팔렴."이라며 자신의 열매를 내어주었습니다. 소년은 사과를 모두 따서 떠나버렸고, 나무는 행복했습니다.

오랜 시간이 흘러 장년이 된 소년이 돌아와 집이 필요하다고 말했을 때, 나무는 자신의 무성한 가지들을 베어 집을 짓게 해주었습니다. 또다시 오랜 세월이 지나 소년이 먼 곳으로 떠나고 싶어 하자, 나무는 자신의 몸통마저 베어 배를 만들 수 있게 해주었습니다. 나무는 소년에게 줄 수 있는 모든 것을 주었지만, 이제 남은 것은 땅 위에 겨우 붙어 있는 늙은 밑동뿐이었습니다. 나무는 행복했지만, 사실은 조금 슬펐습니다.

아주 오랜 시간이 지나 노인이 된 소년이 돌아왔습니다. 나무는 줄 것이 아무것도 남아있지 않아 미안해하며 한숨을 쉬었습니다. "사과도, 가지도, 줄기도 없어서 네가 쉴 곳이 없구나." 그러자 소년은 나직이 대답했습니다. "이제 내게 필요한 건 별로 없어. 그저 앉아서 쉴 조용한 곳이면 돼. 난 너무 피곤하거든." 나무는 굽은 몸뚱이를 애써 펴며 말했습니다. "앉아서 쉬기에는 늙은 나무 밑동이 최고란다. 얘야, 이리로 와서 앉으렴." 소년이 나무 밑동에 앉아 편히 쉬는 모습을 보며, 나무는 진심으로 행복했습니다.`,
    vocabulary: [
      { word: "왕관", meaning: "왕이 머리에 쓰는 관(장식).", example: "소년은 나뭇잎으로 왕관을 만들어 쓰고 놀았어요." },
      { word: "그네", meaning: "줄이나 끈에 매달아 타는 놀이 기구.", example: "소년은 가지에 매달려 그네도 타며 놀았지요." },
      { word: "그늘", meaning: "햇빛이 가려져 어둡고 시원한 곳.", example: "나무는 자신의 그늘을 내어 주어 낮잠을 자게 했어요." },
      { word: "세월", meaning: "시간이 흐르는 과정.", example: "하지만 세월이 흘러 소년이 나이를 먹었어요." },
      { word: "제안", meaning: "어떤 일을 하자고 말함.", example: "나무는 예전처럼 함께 놀자고 제안했어요." },
      { word: "열매", meaning: "나무나 풀에서 맺히는 과일.", example: "나무는 자신의 열매를 내어 주었어요." },
      { word: "시장", meaning: "물건을 사고파는 곳.", example: "소년은 사과를 따서 시장에 팔아 돈을 마련했어요." },
      { word: "무성한", meaning: "풀이거나 나무가 아주 빽빽하고 많다.", example: "나무는 무성한 가지들을 내어주었어요." },
      { word: "밑동", meaning: "나무줄기의 아랫부분.", example: "남은 것은 늙은 나무 밑동뿐이었어요." },
      { word: "장년", meaning: "어른이 되어 한창 일하는 나이.", example: "오랜 시간이 흘러 장년이 된 소년이 돌아왔어요." },
    ],
    coreQuiz: { question: "이 이야기의 핵심 단어는 무엇인가요?", answer: "희생" },
    readQuizzes: [
      { q: "소년이 나무에게 요구한 순서로 맞는 것은?", options: ["돈(사과) → 집(가지) → 배(몸통) → 휴식(밑동)", "집(가지) → 돈(사과) → 배(몸통) → 휴식(밑동)", "돈(사과) → 배(몸통) → 집(가지) → 휴식(밑동)", "돈(사과) → 집(가지) → 휴식(밑동) → 배(몸통)"], ans: 0 },
      { q: "나무가 몸통을 베어 주고도 조금 슬펐던 이유는?", options: ["소년이 더 이상 나무를 사랑하지 않을 것 같아서", "이제 소년에게 더 줄 수 있는 것이 남지 않았다는 슬픔 때문에", "사과가 모두 떨어져 배가 고팠기 때문에", "시장에 갈 돈이 없어서"], ans: 1 },
      { q: "결말에서 나무가 진정으로 행복해진 이유는?", options: ["소년이 큰 돈을 벌어 나무를 다시 키워 줘서", "나무에 사과가 다시 많이 열려서", "아무것도 남지 않았지만 여전히 소년에게 도움이 될 수 있어서", "소년이 다시는 떠나지 않겠다고 약속해서"], ans: 2 },
    ],
  },
  {
    id: "animal-farm",
    title: "동물 농장 (George Orwell)",
    thumbnail: "/images/animal_farm.png",
    content: `영국의 '메이너 농장'에 사는 동물들은 인간 주인의 보살핌 소홀과 매질에 지쳐 있었습니다. 그러던 어느 날, 늙은 돼지 '메이저'가 동물들에게 인간을 몰아내고 우리만의 세상을 만들자는 '혁명'의 씨앗을 심어 주었습니다. 얼마 뒤, 배고픔을 참지 못한 동물들은 주인을 쫓아내고 농장 이름을 '동물 농장'으로 바꿨습니다.

동물들은 "모든 동물은 평등하다"라는 원칙을 세우고, 열심히 일하면 모두가 잘살 수 있다는 희망을 품었습니다. 글을 깨우친 돼지들이 지도자가 되었고, 그중에서도 똑똑한 스노볼과 힘 있는 나폴레옹이 앞장섰습니다. 스노볼은 동물들의 생활을 편하게 해 줄 '풍차'를 지으려 했지만, 권력을 탐낸 나폴레옹은 사나운 개들을 앞세워 스노볼을 내쫓고 독재를 시작했습니다.

나폴레옹은 모든 결정을 혼자 내렸고, 풍차 건설에 반대하던 예전 모습은 잊은 채 풍차를 짓도록 동물들을 혹사시켰습니다. 성실한 말 복서는 "내가 더 열심히 하면 된다"라며 몸을 아끼지 않고 일했지만, 병이 들자 나폴레옹은 그를 도살장에 팔아넘겼습니다.

시간이 흐르며 돼지들은 점점 인간을 닮아 갔습니다. 침대에 누워 자고, 술을 마시고, 나중에는 두 발로 걷기까지 했습니다. 동물들이 믿었던 "모든 동물은 평등하다"라는 문구는 어느새 "하지만 어떤 동물은 다른 동물보다 더욱 평등하다"라는 이상한 문장으로 바뀌어 있었습니다. 농장의 동물들은 창밖에서 돼지와 인간들이 함께 술잔을 기울이는 모습을 지켜보았습니다. 누가 돼지고 누가 인간인지 도무지 구별할 수 없는 지경에 이른 농장의 모습은 예전보다 더 비참해져 있었습니다.`,
    vocabulary: [
      { word: "혁명", meaning: "기존의 질서를 크게 바꾸는 움직임.", example: "메이저는 동물들에게 혁명의 씨앗을 심어 주었어요." },
      { word: "원칙", meaning: "지켜야 할 기본 규칙.", example: "동물들은 평등하다는 원칙을 세웠어요." },
      { word: "권력", meaning: "다른 사람을 움직이게 할 수 있는 힘.", example: "나폴레옹은 권력을 탐내 독재를 시작했어요." },
      { word: "독재", meaning: "한 사람이 모든 권한을 가지는 정치.", example: "나폴레옹은 결정을 혼자 내리며 독재를 했어요." },
      { word: "혹사", meaning: "몹시 심하게 일을 시킴.", example: "풍차를 짓도록 동물들을 혹사시켰어요." },
      { word: "풍차", meaning: "바람의 힘으로 움직이는 장치(시설).", example: "스노볼은 풍차를 지으려 했지만 갈등이 생겼어요." },
      { word: "평등", meaning: "누구나 차별 없이 똑같이 대우받는 것.", example: "처음에는 평등을 약속했지만 점점 변했어요." },
      { word: "구별", meaning: "차이를 알아보고 나눔.", example: "누가 돼지고 누가 인간인지 구별하기 어려웠어요." },
      { word: "지경", meaning: "어떤 상태나 형편.", example: "구별할 수 없는 지경에 이르렀어요." },
      { word: "비참", meaning: "몹시 불행하고 처참함.", example: "농장의 모습은 예전보다 더 비참해졌어요." },
    ],
    coreQuiz: { question: "이 이야기의 핵심 단어는 무엇인가요?", answer: "권력" },
    readQuizzes: [
      { q: "돼지들이 내세운 첫 번째 원칙은?", options: ["모든 동물은 자유롭게 날아야 한다.", "모든 동물은 평등하다.", "모든 동물은 돼지를 따라야 한다.", "모든 동물은 사람을 닮아야 한다."], ans: 1 },
      { q: "나폴레옹이 스노볼을 내쫓은 방법은?", options: ["풍차를 먼저 지어서 인기를 얻었다.", "스노볼에게 사과를 나눠 주며 설득했다.", "사나운 개들을 길러 위협하며 내쫓았다.", "동물들 앞에서 공개 토론으로 이겼다."], ans: 2 },
      { q: "마지막에 돼지와 인간을 구별하지 못한 이유는?", options: ["동물들이 모두 눈이 나빠졌기 때문에", "돼지들이 인간처럼 행동하고 인간과 어울려 지냈기 때문에", "농장에 불이 나서 모두 얼굴이 검게 변했기 때문에", "돼지들이 갑자기 작아졌기 때문에"], ans: 1 },
    ],
  },
  {
    id: "yangbanjeon",
    title: "양반전 (박지원)",
    thumbnail: "/images/yangbanjeon.png",
    content: `옛날 강원도 정선에 한 양반이 살고 있었습니다. 그는 공부를 좋아하고 인품이 훌륭하여 고을 군수조차 그를 존경했지요. 하지만 집이 너무 가난해 나라에서 빌린 곡식인 '환곡'이 어느새 천 석이나 쌓이고 말았습니다. 이 소식을 들은 관찰사는 양반을 감옥에 가두라고 명령했습니다. 이때 마을에 사는 돈 많은 부자가 이 소식을 들었습니다. 부자는 돈은 많았지만 신분이 낮아 늘 무시당하는 것이 한이었기에, 양반 대신 곡식을 모두 갚아 주고 그 대가로 양반 신분을 사기로 했습니다.

군수는 증인이 되어 양반을 사고파는 계약서인 '권문'을 작성했습니다. 첫 번째 계약서에는 양반이 지켜야 할 까다로운 체면과 예절이 가득했습니다. "새벽같이 일어나 책을 읽어야 한다", "더워도 버선을 벗지 마라" 등 겉치레뿐인 내용이었지요. 부자는 이 내용을 듣고 "양반이란 것이 이렇게 따분한 것입니까?"라며 실망했습니다.

부자의 요청에 군수는 두 번째 계약서를 써 주었습니다. 거기에는 양반의 엄청난 특권들이 적혀 있었습니다. "농사를 짓지 않아도 풍족하게 살 수 있다", "이웃의 소를 먼저 가져다 밭을 갈아도 된다", "마음에 안 드는 상민의 얼굴에 잿물을 뿌려도 된다"라는 식이었지요. 이 내용을 들은 부자는 깜짝 놀라며 외쳤습니다. "그만두시오! 이건 양반이 아니라 도둑놈이나 다름없군요!" 부자는 결국 양반이 되는 것을 단번에 포기하고 달아났습니다. 그 후로 부자는 다시는 양반이라는 말을 입 밖에 내지 않았다고 합니다.`,
    vocabulary: [
      { word: "환곡", meaning: "나라에서 백성에게 빌려주던 곡식.", example: "가난한 양반의 환곡이 어느새 천 석이나 쌓였어요." },
      { word: "관찰사", meaning: "옛날에 한 도(道)를 맡아 다스리던 관리.", example: "관찰사는 양반을 감옥에 가두라고 명령했어요." },
      { word: "군수", meaning: "옛날에 고을을 다스리던 관리.", example: "군수는 증인이 되어 계약서를 써 주었어요." },
      { word: "권문", meaning: "양반 신분을 사고파는 계약서.", example: "군수는 권문을 작성해 주었지요." },
      { word: "체면", meaning: "남에게 보이는 품위나 얼굴.", example: "첫 번째 계약서에는 양반의 체면을 지키라는 내용이 많았어요." },
      { word: "예절", meaning: "예의와 바른 행동.", example: "양반은 까다로운 예절을 지켜야 한다고 했어요." },
      { word: "겉치레", meaning: "겉으로만 그럴듯하게 꾸미는 일.", example: "계약서에는 겉치레뿐인 말들이 가득했어요." },
      { word: "특권", meaning: "특별한 사람에게만 주어지는 권리.", example: "두 번째 계약서에는 양반의 특권이 적혀 있었어요." },
      { word: "상민", meaning: "옛날에 신분이 낮은 평민.", example: "양반은 상민을 함부로 대하는 내용까지 있었어요." },
      { word: "실망", meaning: "기대하던 것이 어긋나 마음이 상함.", example: "부자는 첫 번째 계약서를 듣고 실망했어요." },
    ],
    coreQuiz: { question: "이 이야기의 핵심 단어는 무엇인가요?", answer: "허례허식" },
    readQuizzes: [
      { q: "부자가 양반 신분을 사려고 했던 목적은?", options: ["더 많은 곡식을 빌리기 위해", "양반 신분을 사서 무시당하지 않기 위해", "군수가 되기 위해", "농사를 짓지 않기 위해"], ans: 1 },
      { q: "두 번째 계약서에 나타난 양반의 모습으로 알맞은 것은?", options: ["백성을 도우며 착하게 사는 모습", "열심히 농사를 지어 모범이 되는 모습", "매일 책만 읽으며 겸손하게 사는 모습", "백성들을 괴롭히고 자신의 이익만 챙기는 모습"], ans: 3 },
      { q: "작가 박지원이 비판하고자 했던 핵심 내용은?", options: ["공부를 좋아하는 사람은 모두 양반이 되어야 한다", "부자는 항상 가난한 사람을 도와야 한다", "실속 없이 권력만 휘두르는 양반들의 부정부패와 허례허식", "농사를 짓지 않으면 벌을 받아야 한다"], ans: 2 },
    ],
  },
];

/** 분야별: 과학 / 역사 / 사회 (쉬운 글·어려운 글) */
export const categoryStories: ShortStory[] = [
  {
    id: "science-photosynthesis",
    title: "식물의 광합성",
    thumbnail: "/images/science-photosynthesis.png",
    content: `식물은 동물처럼 입으로 음식을 먹지 않아요. 대신 잎에서 스스로 양분을 만듭니다. 이 과정을 '광합성'이라고 해요. 광합성을 하려면 햇빛, 물, 그리고 공기 중의 이산화탄소가 필요해요. 식물은 뿌리로 물을 흡수하고, 잎의 작은 구멍으로 공기를 들이마셔요. 햇빛을 받으면 이 재료들을 섞어 식물이 자라는 데 필요한 설탕 같은 양분을 만들고, 우리가 숨 쉴 때 필요한 산소를 밖으로 내보낸답니다.`,
    section: "과학",
    badges: ["과학", "쉬움"],
    vocabulary: [
      { word: "광합성", meaning: "식물이 햇빛·물·이산화탄소로 양분을 만드는 과정.", example: "식물은 잎에서 광합성을 해요." },
      { word: "양분", meaning: "생명체가 자라거나 살아가는 데 필요한 영양분.", example: "광합성으로 만든 양분으로 식물이 자라요." },
      { word: "흡수", meaning: "빨아들여 받아들임.", example: "식물은 뿌리로 물을 흡수해요." },
      { word: "산소", meaning: "숨 쉴 때 필요한 기체.", example: "식물이 광합성 후 산소를 내보내요." },
    ],
    coreQuiz: { question: "식물이 광합성을 마친 후, 사람과 동물이 숨을 쉴 수 있게 밖으로 내보내는 기체는 무엇인가요?", answer: "산소" },
    readQuizzes: [
      { q: "식물이 광합성을 마친 후, 사람과 동물이 숨을 쉴 수 있게 밖으로 내보내는 기체는 무엇인가요?", options: ["이산화탄소", "산소", "질소", "수소"], ans: 1 },
    ],
  },
  {
    id: "science-earthquake",
    title: "지표의 변화와 지진",
    thumbnail: "/images/science-earthquake.png",
    content: `우리가 딛고 서 있는 땅은 멈춰 있는 것 같지만, 사실 아주 조금씩 움직이고 있습니다. 지구의 겉 부분은 여러 개의 커다란 판으로 이루어져 있는데, 이 판들이 서로 밀거나 당기면서 엄청난 에너지가 쌓이게 됩니다. 그러다 땅이 이 힘을 견디지 못하고 갑자기 끊어지거나 어긋날 때 땅이 흔들리는 '지진'이 발생합니다. 지진은 건물을 무너뜨리거나 바닷물을 끌어올려 큰 파도를 만들기도 합니다. 최근에는 지진을 미리 예측하기 위해 지각의 미세한 움직임을 관찰하는 기술이 발전하고 있습니다. 지진이 발생했을 때는 당황하지 말고 머리를 보호하며 넓은 공터로 대피하는 것이 중요합니다.`,
    section: "과학",
    badges: ["과학", "어려움"],
    vocabulary: [
      { word: "지표", meaning: "지구의 겉면, 땅의 표면.", example: "지표가 흔들리면 지진이에요." },
      { word: "에너지", meaning: "일을 할 수 있는 힘.", example: "판이 움직이며 에너지가 쌓여요." },
      { word: "예측", meaning: "앞일을 미리 짐작함.", example: "지진 예측 기술이 발달했어요." },
      { word: "지각", meaning: "지구의 겉을 이루는 단단한 층.", example: "지각의 움직임을 관찰해요." },
      { word: "대피", meaning: "위험한 곳에서 안전한 곳으로 옮김.", example: "지진 시 넓은 공터로 대피해요." },
    ],
    coreQuiz: { question: "지진이 발생하는 근본적인 원인은 무엇인가요?", answer: "판들이 움직이며 쌓인 에너지가 갑자기 방출되기 때문" },
    readQuizzes: [
      { q: "본문의 내용으로 보아 지진이 발생하는 근본적인 원인은 무엇인가요?", options: ["지구 내부의 온도가 갑자기 낮아지기 때문에", "판들이 움직이며 쌓인 에너지가 갑자기 방출되기 때문에", "태풍이 불어 바닷물이 육지로 밀려오기 때문에", "사람들이 지하 자원을 너무 많이 파냈기 때문에"], ans: 1 },
    ],
  },
  {
    id: "history-sejong",
    title: "세종대왕과 훈민정음",
    thumbnail: "/images/history-sejong.jpg",
    content: `조선 시대의 세종대왕은 백성들을 무척 사랑하셨어요. 당시에는 우리말은 있었지만 글자가 없어서 어려운 한자를 빌려 썼는데, 글을 배우지 못한 백성들은 억울한 일을 당해도 호소할 방법이 없었지요. 세종대왕은 누구나 쉽게 배우고 쓸 수 있는 우리 글자인 '훈민정음'을 만드셨어요. 훈민정음은 '백성을 가르치는 바른 소리'라는 뜻이에요. 덕분에 오늘날 우리는 한글이라는 훌륭한 글자를 가지게 되었답니다.`,
    section: "역사",
    badges: ["역사", "쉬움"],
    vocabulary: [
      { word: "훈민정음", meaning: "백성을 가르치는 바른 소리, 한글의 옛 이름.", example: "세종대왕이 훈민정음을 창제하셨어요." },
      { word: "호소", meaning: "억울하거나 어려울 때 도움을 청함.", example: "백성들은 호소할 방법이 없었어요." },
      { word: "백성", meaning: "나라의 일반 사람들.", example: "세종대왕은 백성을 사랑하셨어요." },
      { word: "창제", meaning: "처음으로 글자나 말을 만듦.", example: "훈민정음은 1443년에 창제되었어요." },
    ],
    coreQuiz: { question: "'훈민정음'이라는 이름에 담긴 뜻은 무엇인가요?", answer: "백성을 가르치는 바른 소리" },
    readQuizzes: [
      { q: "'훈민정음'이라는 이름에 담긴 뜻은 무엇인가요?", options: ["임금이 쓰는 귀한 글자", "백성을 가르치는 바른 소리", "중국 한자를 쉽게 바꾸는 법", "세계에서 가장 오래된 글자"], ans: 1 },
    ],
  },
  {
    id: "history-ganghwa",
    title: "강화도 조약과 근대화",
    thumbnail: "/images/history-ganghwa.png",
    content: `조선 후기, 서양의 여러 나라가 문을 열 것을 요구하며 한반도로 다가왔습니다. 조선은 처음에는 교류를 거절했지만, 1876년 일본의 강요로 우리나라 최초의 근대적 조약인 '강화도 조약'을 맺게 되었습니다. 이 조약은 우리나라가 세계로 문을 여는 계기가 되었지만, 일본에만 유리한 내용이 담긴 '불평등 조약'이었습니다. 이후 조선에는 전등, 기차, 우체국 같은 근대 문물이 들어오기 시작했습니다. 하지만 외국의 힘에 의존하게 되면서 나라의 주권을 지키기 위한 많은 독립운동가의 노력이 이어지게 되었습니다.`,
    section: "역사",
    badges: ["역사", "어려움"],
    vocabulary: [
      { word: "근대적", meaning: "현대에 가까운 시대의 방식.", example: "강화도 조약은 근대적 조약이에요." },
      { word: "조약", meaning: "나라와 나라 사이에 맺는 약속.", example: "강화도 조약은 1876년에 맺어졌어요." },
      { word: "불평등", meaning: "한쪽만 유리하고 공정하지 않음.", example: "강화도 조약은 불평등 조약이었어요." },
      { word: "문물", meaning: "문명과 문화의 산물.", example: "전등, 기차 같은 근대 문물이 들어왔어요." },
      { word: "주권", meaning: "나라가 스스로를 다스리는 권리.", example: "주권을 지키기 위해 독립운동이 일어났어요." },
    ],
    coreQuiz: { question: "강화도 조약에 대한 설명으로 맞는 것은?", answer: "우리나라 최초의 근대적 조약이지만 일본에 유리한 불평등 조약이었다" },
    readQuizzes: [
      { q: "강화도 조약에 대한 설명 중 본문의 내용과 일치하는 것은 무엇인가요?", options: ["조선이 먼저 일본에 제안하여 맺은 공정한 조약이다.", "우리나라 최초의 근대적 조약이지만 일본에 유리한 불평등 조약이었다.", "조약 이후 서양 문물의 유입이 완전히 차단되었다.", "일본의 도움을 받아 조선이 세계에서 가장 부유한 나라가 되었다."], ans: 1 },
    ],
  },
  {
    id: "society-scarcity",
    title: "희소성과 합리적 선택",
    thumbnail: "/images/society-scarcity.png",
    content: `우리는 매일 선택을 하며 살아요. 아이스크림을 먹을지 떡볶이를 먹을지 고민하는 이유는 우리가 가진 돈과 시간은 정해져 있기 때문이에요. 세상에 있는 자원은 한정되어 있는데 사람들의 욕심은 끝이 없는 현상을 '희소성'이라고 해요. 희소성 때문에 우리는 가장 가치 있는 것을 고르는 '합리적 선택'을 해야 합니다.`,
    section: "사회",
    badges: ["사회", "쉬움"],
    vocabulary: [
      { word: "자원", meaning: "쓰거나 쓸 수 있는 재료·돈·시간 등.", example: "세상의 자원은 한정되어 있어요." },
      { word: "한정", meaning: "일정한 한도가 있음.", example: "시간과 돈은 한정되어 있어요." },
      { word: "희소성", meaning: "자원은 한정되어 있는데 욕구는 끝이 없는 현상.", example: "희소성 때문에 선택을 해야 해요." },
      { word: "합리적", meaning: "이치에 맞고 논리적임.", example: "합리적 선택을 하려고 해요." },
    ],
    coreQuiz: { question: "자원은 한정되어 있는데 욕구는 끝이 없는 현상을 무엇이라 하나요?", answer: "희소성" },
    readQuizzes: [
      { q: "사람들의 욕구는 끝이 없으나 세상에 있는 자원은 한정되어 있는 현상을 무엇이라 하나요?", options: ["풍요성", "다양성", "희소성", "필요성"], ans: 2 },
    ],
  },
  {
    id: "society-democracy",
    title: "민주주의와 선거",
    thumbnail: "/images/society-democracy.png",
    content: `민주주의 사회에서 국민의 뜻을 한데 모으는 가장 중요한 방법은 바로 '선거'입니다. 선거는 우리를 대신하여 나라의 일을 맡아 할 대표자를 뽑는 과정입니다. 민주 선거에는 네 가지 기본 원칙이 있습니다. 누구나 만 18세가 되면 투표할 수 있는 '보통 선거', 성별이나 재산에 상관없이 똑같이 한 표씩 행사하는 '평등 선거', 자신이 누구에게 투표했는지 남이 알지 못하게 하는 '비밀 선거', 그리고 대리인을 거치지 않고 본인이 직접 투표하는 '직접 선거'가 그것입니다.`,
    section: "사회",
    badges: ["사회", "어려움"],
    vocabulary: [
      { word: "민주주의", meaning: "국민이 나라의 주인이 되는 정치 방식.", example: "민주주의에서 선거가 중요해요." },
      { word: "대표자", meaning: "여럿을 대신하여 말하거나 일하는 사람.", example: "선거로 대표자를 뽑아요." },
      { word: "원칙", meaning: "지켜야 할 기본 규칙.", example: "민주 선거의 네 가지 원칙이 있어요." },
      { word: "행사", meaning: "권리나 힘을 쓰다.", example: "한 표씩 행사하는 평등 선거예요." },
      { word: "정당한", meaning: "도리에 맞고 올바름.", example: "정당한 절차로 선거를 해요." },
    ],
    coreQuiz: { question: "민주 선거의 4대 원칙 중 '보통 선거'는 무엇인가요?", answer: "일정한 나이가 되면 누구나 투표할 수 있는 것" },
    readQuizzes: [
      { q: "다음 중 민주 선거의 4대 원칙과 그 설명이 바르게 연결된 것은 무엇인가요?", options: ["비밀 선거 - 부자나 가난한 사람이나 똑같이 한 표를 주는 것", "직접 선거 - 부모님이 나 대신 투표해 주는 것", "보통 선거 - 일정한 나이가 되면 누구나 투표할 수 있는 것", "평등 선거 - 자신이 누구에게 투표했는지 남에게 말하는 것"], ans: 2 },
    ],
  },
];

/** 디지털 문해력 */
export const digitalLiteracy: ShortStory[] = [
  {
    id: "digital-plastic",
    title: "플라스틱 줄이기 캠페인",
    thumbnail: "/images/digital-plastic.jpg",
    content: `최근 바다 동물의 뱃속에서 플라스틱 쓰레기가 발견되었다는 뉴스가 자주 들려옵니다. 우리가 무심코 버린 빨대와 비닐봉지가 수백 년 동안 썩지 않고 바다를 오염시키고 있습니다. 이에 따라 많은 카페에서 종이 빨대를 사용하고, 마트에서는 일회용 봉투 대신 장바구니 사용을 권장하고 있습니다. 환경 전문가는 "플라스틱 사용을 줄이는 것은 이제 선택이 아닌 지구를 지키기 위한 필수 과제"라고 강조했습니다.`,
    format: "신문기사",
    badges: ["디지털", "신문기사"],
    vocabulary: [
      { word: "권장", meaning: "하라고 추천하거나 말함.", example: "마트에서 장바구니 사용을 권장해요." },
      { word: "오염", meaning: "더럽혀져 해로워짐.", example: "바다를 오염시키지 맙시다." },
      { word: "일회용", meaning: "한 번 쓰고 버리는.", example: "일회용 봉투 대신 장바구니를 써요." },
      { word: "필수", meaning: "꼭 있어야 하는.", example: "플라스틱 줄이기는 필수 과제예요." },
    ],
    coreQuiz: { question: "환경 오염을 막기 위해 마트에서 권장하는 실천 방법은?", answer: "장바구니 사용하기" },
    readQuizzes: [
      { q: "기사에서 환경 오염을 막기 위해 마트에서 권장하는 실천 방법은 무엇인가요?", options: ["종이 빨대 사용하기", "일회용 봉투 많이 사기", "장바구니 사용하기", "음식물 쓰레기 줄이기"], ans: 2 },
    ],
  },
  {
    id: "digital-fakenews",
    title: "가짜 뉴스 판별하기",
    thumbnail: "/images/digital-fakenews.png",
    content: `인터넷과 SNS에는 매일 엄청난 정보가 올라옵니다. 하지만 그중에는 사람들을 속이기 위해 만든 '가짜 뉴스'가 섞여 있어요. 가짜 뉴스는 자극적인 제목으로 우리의 눈길을 끌지만, 근거가 부족하거나 지어낸 이야기인 경우가 많습니다. 정보를 믿기 전에 먼저 누가 쓴 글인지 확인하고, 다른 언론사에서도 같은 내용을 보도했는지 비교해 봐야 합니다. 비판적으로 생각하는 습관이 우리를 가짜 뉴스에서 지켜줍니다.`,
    format: "미디어 비판",
    badges: ["디지털", "미디어 비판"],
    vocabulary: [
      { word: "SNS", meaning: "소셜 네트워크 서비스, 사람들이 소통하는 인터넷 공간.", example: "SNS에 많은 정보가 올라와요." },
      { word: "자극적", meaning: "감정이나 관심을 크게 일으키는.", example: "자극적인 제목에 속지 마세요." },
      { word: "근거", meaning: "말이나 주장의 바탕이 되는 자료.", example: "근거가 부족한 글은 의심해 보세요." },
      { word: "비판적", meaning: "옳고 그름을 따져 생각하는.", example: "비판적으로 읽는 습관이 중요해요." },
    ],
    coreQuiz: { question: "가짜 뉴스에 속지 않기 위한 올바른 태도는?", answer: "다른 기사와 비교하며 비판적으로 확인한다" },
    readQuizzes: [
      { q: "가짜 뉴스에 속지 않기 위해 정보를 받아들이는 올바른 태도는 무엇인가요?", options: ["자극적인 제목만 보고 믿는다.", "다른 기사와 비교하며 비판적으로 확인한다.", "가장 먼저 올라온 뉴스를 무조건 믿는다.", "친구가 보내준 정보는 확인 없이 공유한다."], ans: 1 },
    ],
  },
];

/** 홈 '오늘의 추천 글'용: short + category + digital 통합 목록 (source로 경로 구분) */
export type StorySource = "short" | "category" | "digital";

export interface StoryForHome {
  story: ShortStory;
  source: StorySource;
  href: string;
}

export function getAllStoriesForHome(): StoryForHome[] {
  const short: StoryForHome[] = shortStories.map((s) => ({
    story: { ...s, badges: [...(s.badges ?? []), "짧은 글"] },
    source: "short",
    href: `/reading/short/${s.id}`,
  }));
  const category: StoryForHome[] = categoryStories.map((s) => ({
    story: s,
    source: "category",
    href: `/reading/category/${s.id}`,
  }));
  const digital: StoryForHome[] = digitalLiteracy.map((s) => ({
    story: s,
    source: "digital",
    href: `/reading/digital/${s.id}`,
  }));
  return [...short, ...category, ...digital];
}

export function getRandomStoryForHome(): StoryForHome {
  const all = getAllStoriesForHome();
  return all[Math.floor(Math.random() * all.length)]!;
}

export const getShortStoryById = (id: string): ShortStory | undefined =>
  shortStories.find((s) => s.id === id);

export const getLongStoryById = (id: string): ShortStory | undefined =>
  longStories.find((s) => s.id === id);

export const getCategoryStoryById = (id: string): ShortStory | undefined =>
  categoryStories.find((s) => s.id === id);

export const getDigitalStoryById = (id: string): ShortStory | undefined =>
  digitalLiteracy.find((s) => s.id === id);

/** 분야별 글 읽기 카드 클릭 시 랜덤 1편 id */
export function getRandomCategoryStoryId(): string {
  const story = categoryStories[Math.floor(Math.random() * categoryStories.length)];
  return story?.id ?? categoryStories[0]!.id;
}

/** 디지털 문해력 카드 클릭 시 랜덤 1편 id */
export function getRandomDigitalStoryId(): string {
  const story = digitalLiteracy[Math.floor(Math.random() * digitalLiteracy.length)];
  return story?.id ?? digitalLiteracy[0]!.id;
}
