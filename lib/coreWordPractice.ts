/**
 * 핵심 단어 찾기 연습 - 10문제 데이터
 */

export interface CoreWordQuizItem {
  id: number;
  sentence: string;
  correctAnswer: string;
  /** 클릭 가능한 후보 단어 (정답 + 오답) */
  selectableWords: string[];
  /** 정답 시 캐릭터 말풍선 메시지 */
  correctFeedback: string;
}

export const CORE_WORD_QUIZ_ITEMS: CoreWordQuizItem[] = [
  {
    id: 1,
    sentence:
      "공동체 의식이란, 모든 사람이 서로 도우며 한 식구처럼 아끼고 서로를 사랑하는 마음을 말한다.",
    correctAnswer: "공동체 의식",
    selectableWords: ["공동체 의식", "식구", "사랑", "마음"],
    correctFeedback:
      "정답이야! 우리 모두가 연결되어 있다는 '공동체 의식'이 이 문장의 주인공이야! 🐾",
  },
  {
    id: 2,
    sentence:
      "지구 온난화란 지구의 평균 기온이 평상시보다 높아져 지구가 뜨거워지는 현상을 말한다.",
    correctAnswer: "지구 온난화",
    selectableWords: ["지구 온난화", "평균 기온", "지구", "현상"],
    correctFeedback:
      "정답이야! '지구 온난화'가 이 문장에서 설명하는 주제야. 잘 찾았어! 🐾",
  },
  {
    id: 3,
    sentence:
      "광합성은 식물이 빛 에너지를 이용하여 이산화 탄소와 물로 양분을 만드는 과정이다.",
    correctAnswer: "광합성",
    selectableWords: ["광합성", "식물", "빛 에너지", "양분"],
    correctFeedback:
      "정답이야! '광합성'이 이 문장의 핵심 주제야. 훌륭해! 🐾",
  },
  {
    id: 4,
    sentence:
      "재활용은 버려지는 자원을 다시 사용하여 쓰레기를 줄이고 환경을 보호하는 활동이다.",
    correctAnswer: "재활용",
    selectableWords: ["재활용", "자원", "쓰레기", "환경"],
    correctFeedback:
      "정답이야! '재활용'이 문장 전체를 대표하는 핵심 단어야. 잘했어! 🐾",
  },
  {
    id: 5,
    sentence:
      "인공지능이란 컴퓨터 프로그램이 인간처럼 스스로 생각하고 학습하며 판단하는 기능을 말한다.",
    correctAnswer: "인공지능",
    selectableWords: ["인공지능", "컴퓨터", "학습", "판단"],
    correctFeedback:
      "정답이야! '인공지능'이 이 문장이 설명하는 주인공이야. 대단해! 🐾",
  },
  {
    id: 6,
    sentence:
      "저작권이란 소설, 시, 그림과 같이 사람이 만든 창작물에 대해 가지는 권리를 의미한다.",
    correctAnswer: "저작권",
    selectableWords: ["저작권", "창작물", "권리", "그림"],
    correctFeedback:
      "정답이야! '저작권'이 이 문장의 핵심이야. 정확히 찾았어! 🐾",
  },
  {
    id: 7,
    sentence:
      "민주주의는 국가의 주권이 국민에게 있고, 국민을 위하여 정치가 이루어지는 제도를 뜻한다.",
    correctAnswer: "민주주의",
    selectableWords: ["민주주의", "국민", "주권", "정치"],
    correctFeedback:
      "정답이야! '민주주의'가 문장 전체의 주제야. 잘 찾았어! 🐾",
  },
  {
    id: 8,
    sentence:
      "멸종 위기 동물이란 개체 수가 급격히 줄어들어 지구상에서 사라질 위험에 처한 생물을 말한다.",
    correctAnswer: "멸종 위기 동물",
    selectableWords: ["멸종 위기 동물", "개체 수", "지구", "생물"],
    correctFeedback:
      "정답이야! '멸종 위기 동물'이 이 문장이 설명하는 핵심이야. 훌륭해! 🐾",
  },
  {
    id: 9,
    sentence:
      "전통문화는 한 나라에서 예전부터 전해 내려와 그 나라만의 독특한 특징이 담긴 생활 양식이다.",
    correctAnswer: "전통문화",
    selectableWords: ["전통문화", "나라", "특징", "양식"],
    correctFeedback:
      "정답이야! '전통문화'가 이 문장의 주인공이야. 잘했어! 🐾",
  },
  {
    id: 10,
    sentence:
      "비언어적 소통은 말 대신 표정, 몸짓, 눈빛 등을 사용하여 상대방에게 마음을 전달하는 방식이다.",
    correctAnswer: "비언어적 소통",
    selectableWords: ["비언어적 소통", "표정", "몸짓", "마음"],
    correctFeedback:
      "정답이야! '비언어적 소통'이 이 문장의 핵심이야. 정확해! 🐾",
  },
];
