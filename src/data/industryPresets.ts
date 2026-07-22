import { IndustryBenchmark } from '../types';

export const DEFAULT_INDUSTRIES: IndustryBenchmark[] = [
  {
    id: 'manufacturing',
    name: '제조업 (Manufacturing)',
    energyIntensity: 210,
    renewableRate: 45,
    ghgIntensity: 48.5,
    wasteIntensity: 1.8,
    recyclingRate: 85,
    disclosureScore: 88,
    socialScore: 85,
    description: '에너지 소모와 제조 부산물이 많은 업종으로, 친환경 설비 도입 및 폐기물 재자원화가 핵심 과제입니다.',
    keyChallenge: '생산 가동 시 화석연료 대체 및 자원 순환 체계 도입 고도화',
    targetCompanies: [
      {
        name: '한울그린스틸',
        energyIntensity: 195,
        renewableRate: 55,
        ghgIntensity: 42.0,
        wasteIntensity: 1.2,
        recyclingRate: 92,
        disclosureScore: 95,
        socialScore: 88,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '생산 부산물 및 고철 원료의 90% 이상 재자원화 및 폐열 회수 발전 도입'
      },
      {
        name: '에코케미칼',
        energyIntensity: 205,
        renewableRate: 48,
        ghgIntensity: 45.8,
        wasteIntensity: 1.5,
        recyclingRate: 86,
        disclosureScore: 90,
        socialScore: 84,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '바이오 플라스틱 등 재생 원료 전환 및 자체 폐수 재순환 95% 달성'
      }
    ]
  },
  {
    id: 'it-service',
    name: 'IT 및 서비스업 (IT & Service)',
    energyIntensity: 45,
    renewableRate: 85,
    ghgIntensity: 9.8,
    wasteIntensity: 0.25,
    recyclingRate: 60,
    disclosureScore: 92,
    socialScore: 90,
    description: '물리적 배출은 적으나 데이터 센터 구동 등으로 전력 사용량이 많으며, 공급망 전반의 Scope 3 배출 통제와 ESG 공시가 중요합니다.',
    keyChallenge: '친환경 데이터 센터 활용 및 공급망 ESG 관리 수준 향상',
    targetCompanies: [
      {
        name: '네오스마트웹',
        energyIntensity: 38,
        renewableRate: 100,
        ghgIntensity: 8.2,
        wasteIntensity: 0.15,
        recyclingRate: 75,
        disclosureScore: 96,
        socialScore: 95,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '친환경 가상화 서버 적용 및 공급망 전반의 온실가스 통합 검증 시스템 구축'
      },
      {
        name: '메타솔루션즈',
        energyIntensity: 42,
        renewableRate: 90,
        ghgIntensity: 9.0,
        wasteIntensity: 0.20,
        recyclingRate: 65,
        disclosureScore: 94,
        socialScore: 92,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '사무용품 생분해 소재 교체 및 임직원 자율 출퇴근 탄소 크레딧 차감 프로그램'
      }
    ]
  },
  {
    id: 'food-retail',
    name: '식음료 및 유통업 (Food & Retail)',
    energyIntensity: 115,
    renewableRate: 40,
    ghgIntensity: 22.4,
    wasteIntensity: 2.1,
    recyclingRate: 75,
    disclosureScore: 82,
    socialScore: 88,
    description: '포장재 쓰레기와 물류 이동 시 탄소 발생이 특징이며, 친환경 원료 수급과 플라스틱 절감이 핵심인 업종입니다.',
    keyChallenge: '포장재 재활용율 제고 및 물류 수송 과정 탄소 감축',
    targetCompanies: [
      {
        name: '더푸드그린',
        energyIntensity: 105,
        renewableRate: 50,
        ghgIntensity: 19.5,
        wasteIntensity: 1.4,
        recyclingRate: 85,
        disclosureScore: 88,
        socialScore: 90,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '유기농 로컬 푸드 공급선 다각화 및 폐플라스틱 용기 수거 및 100% PCR 대체'
      },
      {
        name: '메가유통',
        energyIntensity: 110,
        renewableRate: 42,
        ghgIntensity: 21.0,
        wasteIntensity: 1.8,
        recyclingRate: 78,
        disclosureScore: 85,
        socialScore: 86,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '전기 배송차 전면 확대 및 하이브리드 냉동 창고 물류센터 구축'
      }
    ]
  },
  {
    id: 'fashion-textile',
    name: '패션 및 섬유업 (Fashion & Textile)',
    energyIntensity: 130,
    renewableRate: 50,
    ghgIntensity: 31.2,
    wasteIntensity: 2.5,
    recyclingRate: 80,
    disclosureScore: 80,
    socialScore: 86,
    description: '원단 가공 시 물과 화학물질 사용량이 많으며, 지속가능한 유기농/재활용 소재 사용과 윤리적 공급망 관리가 중요합니다.',
    keyChallenge: '친환경 및 재생 소재 사용량 확대, 전 공급망 노동 인권 점검',
    targetCompanies: [
      {
        name: '비건패션랩',
        energyIntensity: 115,
        renewableRate: 65,
        ghgIntensity: 26.5,
        wasteIntensity: 1.6,
        recyclingRate: 90,
        disclosureScore: 85,
        socialScore: 92,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '선인장 가죽 등 전 품목 완전 친환경 가죽·패브릭 대체 브랜드 구축'
      },
      {
        name: '그린실렉션',
        energyIntensity: 125,
        renewableRate: 55,
        ghgIntensity: 29.8,
        wasteIntensity: 2.0,
        recyclingRate: 84,
        disclosureScore: 82,
        socialScore: 88,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '의류 폐기물 분쇄 후 재생 원사 뽑아내는 폐자원 완전 순환(Closed Loop) 가동'
      }
    ]
  },
  {
    id: 'logistics-transport',
    name: '물류 및 운송업 (Logistics & Transport)',
    energyIntensity: 280,
    renewableRate: 35,
    ghgIntensity: 65.0,
    wasteIntensity: 1.1,
    recyclingRate: 55,
    disclosureScore: 85,
    socialScore: 82,
    description: '연료 연소로 인한 직접 배출량(Scope 1)이 가장 큰 비중을 차지하며, 친환경 모빌리티 전환과 경로 최적화가 필수적입니다.',
    keyChallenge: '전기·수소 화물차로의 조기 전환 및 유류 사용 절감 알고리즘 개발',
    targetCompanies: [
      {
        name: '녹색운송테크',
        energyIntensity: 250,
        renewableRate: 45,
        ghgIntensity: 54.0,
        wasteIntensity: 0.7,
        recyclingRate: 70,
        disclosureScore: 90,
        socialScore: 85,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '물류 전용 수소 대형 화물 트럭 시범 운행 및 충전 인프라 직접 확보'
      },
      {
        name: '에코익스프레스',
        energyIntensity: 265,
        renewableRate: 38,
        ghgIntensity: 60.5,
        wasteIntensity: 0.9,
        recyclingRate: 62,
        disclosureScore: 88,
        socialScore: 84,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '라스트마일 전기 오토바이/카고 바이크 100% 도입 및 허브 경로 AI 고도화'
      }
    ]
  },
  {
    id: 'construction',
    name: '건설 및 부동산 (Construction)',
    energyIntensity: 180,
    renewableRate: 30,
    ghgIntensity: 42.0,
    wasteIntensity: 4.5,
    recyclingRate: 90,
    disclosureScore: 78,
    socialScore: 80,
    description: '건설 자재 조달 및 폐기 단계에서 막대한 자원이 소요되므로, 친환경 공법 도입과 에너지를 자급하는 건축 기술(ZEB)이 요구됩니다.',
    keyChallenge: '친환경 저탄소 콘크리트 및 내구재 도입, 현장 자원 선별 재활용',
    targetCompanies: [
      {
        name: '그린시티개발',
        energyIntensity: 160,
        renewableRate: 40,
        ghgIntensity: 35.5,
        wasteIntensity: 2.8,
        recyclingRate: 95,
        disclosureScore: 85,
        socialScore: 84,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '국내 최고 수준의 에너지 자립률 40% 이상 제로에너지 공동주택 본공사 완공'
      },
      {
        name: '에코토건',
        energyIntensity: 172,
        renewableRate: 35,
        ghgIntensity: 38.2,
        wasteIntensity: 3.2,
        recyclingRate: 91,
        disclosureScore: 80,
        socialScore: 82,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '건설 폐기물 90% 현장 즉시 재가공 및 시멘트 탄소 흡수 신소재 도입'
      }
    ]
  }
];
