/**
 * 오늘의 단어 - 50개 리스트 (순우리말 20, 한자어 20, 외래어 10)
 * 메인 '오늘의 단어' 컴포넌트에서 이 리스트만 사용해 랜덤 노출.
 */

export type WordType = "순우리말" | "한자어" | "외래어";

export interface TodayWordItem {
  word: string;
  meaning: string;
  example: string;
  type: WordType;
}

export const TODAY_WORD_LIST: TodayWordItem[] = [
  // 순우리말 (20개)
  { word: "꾸준히", meaning: "잠시도 쉬지 않고 계속", example: "꾸준히 연습하면 실력이 늘어요.", type: "순우리말" },
  { word: "슬기", meaning: "어려운 일을 잘 해결하는 지혜", example: "슬기를 모아 문제를 해결했어요.", type: "순우리말" },
  { word: "어림", meaning: "대강 짐작함", example: "어림으로 길이를 재 보았어요.", type: "순우리말" },
  { word: "고루", meaning: "빠짐없이 모두", example: "음식을 고루 먹어야 해요.", type: "순우리말" },
  { word: "마주", meaning: "서로 얼굴을 보며", example: "친구와 마주 앉아 이야기했어요.", type: "순우리말" },
  { word: "드디어", meaning: "기다리던 일이 마침내", example: "드디어 방학이 시작됐어요.", type: "순우리말" },
  { word: "차츰", meaning: "조금씩", example: "날씨가 차츰 따뜻해졌어요.", type: "순우리말" },
  { word: "새삼", meaning: "다시 새롭게 느끼며", example: "부모님의 사랑이 새삼 고마웠어요.", type: "순우리말" },
  { word: "바르게", meaning: "옳고 곧게", example: "줄을 바르게 서야 해요.", type: "순우리말" },
  { word: "한결", meaning: "전보다 더", example: "오늘은 한결 기분이 좋아요.", type: "순우리말" },
  { word: "더욱", meaning: "더 많이", example: "노력하면 더욱 발전할 수 있어요.", type: "순우리말" },
  { word: "문득", meaning: "갑자기", example: "문득 친구 생각이 났어요.", type: "순우리말" },
  { word: "다소", meaning: "조금", example: "오늘은 다소 추워요.", type: "순우리말" },
  { word: "고이", meaning: "정성스럽게", example: "선물을 고이 포장했어요.", type: "순우리말" },
  { word: "이따금", meaning: "가끔", example: "이따금 하늘을 올려다봐요.", type: "순우리말" },
  { word: "살며시", meaning: "소리 없이 조용히", example: "살며시 문을 열었어요.", type: "순우리말" },
  { word: "두루", meaning: "여기저기 널리", example: "두루 살펴보고 결정했어요.", type: "순우리말" },
  { word: "오롯이", meaning: "오직 하나로", example: "그 일에 오롯이 집중했어요.", type: "순우리말" },
  { word: "제법", meaning: "생각보다 꽤", example: "제법 실력이 늘었어요.", type: "순우리말" },
  { word: "비로소", meaning: "이제야 처음으로", example: "비로소 뜻을 이해했어요.", type: "순우리말" },
  // 한자어 (20개)
  { word: "책임", meaning: "맡은 일을 끝까지 해내야 하는 의무", example: "맡은 일은 책임 있게 해야 해요.", type: "한자어" },
  { word: "존중", meaning: "귀하게 여기고 함부로 대하지 않음", example: "친구의 생각을 존중해야 해요.", type: "한자어" },
  { word: "노력", meaning: "힘을 다해 애씀", example: "노력하면 원하는 것을 이룰 수 있어요.", type: "한자어" },
  { word: "결과", meaning: "어떤 일의 마지막에 나타난 것", example: "결과를 보고 다시 생각했어요.", type: "한자어" },
  { word: "원인", meaning: "일이 일어나게 된 까닭", example: "사고의 원인을 찾고 있어요.", type: "한자어" },
  { word: "과정", meaning: "일이 진행되는 차례", example: "과정이 중요해요.", type: "한자어" },
  { word: "계획", meaning: "앞으로 할 일을 미리 정함", example: "여행 계획을 세웠어요.", type: "한자어" },
  { word: "해결", meaning: "문제를 풀어냄", example: "어려운 문제를 해결했어요.", type: "한자어" },
  { word: "선택", meaning: "여러 가지 중 하나를 고름", example: "신중하게 선택하세요.", type: "한자어" },
  { word: "판단", meaning: "옳고 그름을 생각해 정함", example: "정확한 판단이 필요해요.", type: "한자어" },
  { word: "관찰", meaning: "자세히 살펴봄", example: "식물의 변화를 관찰했어요.", type: "한자어" },
  { word: "비교", meaning: "서로 다른 점과 같은 점을 살핌", example: "두 책을 비교해 보았어요.", type: "한자어" },
  { word: "이해", meaning: "뜻을 잘 알아차림", example: "내용을 이해했나요?", type: "한자어" },
  { word: "표현", meaning: "생각이나 느낌을 나타냄", example: "생각을 글로 표현해 보세요.", type: "한자어" },
  { word: "설명", meaning: "알기 쉽게 풀어 말함", example: "선생님이 자세히 설명해 주셨어요.", type: "한자어" },
  { word: "경험", meaning: "직접 겪어 봄", example: "다양한 경험이 중요해요.", type: "한자어" },
  { word: "습관", meaning: "자주 반복되어 굳어진 행동", example: "책 읽는 습관을 들여요.", type: "한자어" },
  { word: "협력", meaning: "힘을 합쳐 도움", example: "친구와 협력해 과제를 했어요.", type: "한자어" },
  { word: "배려", meaning: "다른 사람을 생각해 줌", example: "서로 배려하는 마음이 필요해요.", type: "한자어" },
  { word: "변화", meaning: "모습이나 상태가 달라짐", example: "계절의 변화를 느껴요.", type: "한자어" },
  // 외래어 (10개)
  { word: "아이디어", meaning: "새롭게 떠오른 생각", example: "재미있는 아이디어가 떠올랐어요.", type: "외래어" },
  { word: "계획표", meaning: "할 일을 적어 둔 표", example: "계획표를 보고 공부해요.", type: "외래어" },
  { word: "프로젝트", meaning: "함께 힘을 모아 하는 큰 활동", example: "환경 보호 프로젝트를 시작했어요.", type: "외래어" },
  { word: "리더", meaning: "이끄는 사람", example: "반의 리더를 맡았어요.", type: "외래어" },
  { word: "팀워크", meaning: "함께 힘을 모으는 협력", example: "팀워크가 좋아야 성공해요.", type: "외래어" },
  { word: "미디어", meaning: "정보를 전하는 매체", example: "다양한 미디어를 통해 뉴스를 봐요.", type: "외래어" },
  { word: "데이터", meaning: "조사해서 모은 정보", example: "데이터를 모아 정리했어요.", type: "외래어" },
  { word: "프로그램", meaning: "어떤 일을 하도록 짜여진 계획", example: "방송 프로그램을 시청했어요.", type: "외래어" },
  { word: "캠페인", meaning: "목적을 이루기 위한 활동", example: "절약 캠페인에 참여했어요.", type: "외래어" },
  { word: "매뉴얼", meaning: "사용 방법을 적은 안내서", example: "매뉴얼을 읽고 사용하세요.", type: "외래어" },
];

/** 리스트에서 랜덤으로 한 개 단어 선택 */
export function pickRandomTodayWord(): TodayWordItem {
  const index = Math.floor(Math.random() * TODAY_WORD_LIST.length);
  return TODAY_WORD_LIST[index];
}
