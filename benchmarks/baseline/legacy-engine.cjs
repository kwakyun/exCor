var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// <stdin>
var stdin_exports = {};
__export(stdin_exports, {
  ALLEY_DISTRICTS: () => ALLEY_DISTRICTS,
  PlanApiClient: () => PlanApiClient,
  SPOTS_DATA: () => SPOTS_DATA,
  generateTravelPlan: () => generateTravelPlan,
  swapSpotInPlan: () => swapSpotInPlan
});
module.exports = __toCommonJS(stdin_exports);

// src/data/busanAlleys.ts
var ALLEY_DISTRICTS = [
  {
    id: "jeonpo",
    name: "\uC11C\uBA74 \uC804\uD3EC \uCE74\uD398\uAC70\uB9AC & \uACF5\uAD6C\uACE8\uBAA9",
    subName: "\uC804\uB9AC\uB2E8\uAE38 & \uC0AC\uC0C1\uACF5\uAD6C\uACE8\uBAA9\uC758 \uD799\uD55C \uBCC0\uC2E0",
    badge: "MZ \uC131\uC9C0 / \uC2A4\uD398\uC15C\uD2F0 \uCEE4\uD53C",
    tagline: "\uCCA0\uBB3C\xB7\uACF5\uAD6C\uACE8\uBAA9\uC5D0\uC11C \uC2A4\uD398\uC15C\uD2F0 \uCEE4\uD53C\uC640 \uD2B8\uB80C\uB514\uD55C \uBB38\uD654\uC758 \uC131\uC9C0\uB85C",
    description: "\uACFC\uAC70 \uACF5\uAD6C\uC0C1\uACFC \uBAA9\uC7AC\uC18C\uAC00 \uBC00\uC9D1\uD588\uB358 \uC804\uD3EC\uB3D9 \uACE8\uBAA9\uC774 \uAD6D\uB0B4 \uCD5C\uACE0\uC758 \uC2A4\uD398\uC15C\uD2F0 \uCE74\uD398\uC640 \uAC1C\uC131 \uB118\uCE58\uB294 \uD3B8\uC9D1\uC20D \uAC70\uB9AC\uB85C \uC7AC\uD0C4\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
    themeTags: ["\uC2A4\uD398\uC15C\uD2F0\uCEE4\uD53C", "\uAC10\uC131\uC778\uD14C\uB9AC\uC5B4", "\uB514\uC800\uD2B8\uC131\uC9C0", "\uC18C\uD488\uC0F5\uD22C\uC5B4"],
    emoji: "\u2615",
    accentColor: "#e07a5f",
    theme: "cafe_dessert",
    recommendedBudgetMin: 25e3,
    recommendedBudgetMax: 6e4,
    subwayStation: "\uC804\uD3EC\uC5ED (2\uD638\uC120) 7\uBC88 \uCD9C\uAD6C / \uC11C\uBA74\uC5ED (1\xB72\uD638\uC120) 8\uBC88 \uCD9C\uAD6C",
    localTip: "\uB3D9\uBC31\uC804(\uBD80\uC0B0 \uC9C0\uC5ED\uD654\uD3D0) \uACB0\uC81C \uC2DC 5~7% \uCE90\uC2DC\uBC31 \uD61C\uD0DD\uC774 \uC801\uC6A9\uB418\uB294 \uC18C\uC0C1\uACF5\uC778 \uB9E4\uC7A5\uC774 \uBC00\uC9D1\uD574 \uC788\uC2B5\uB2C8\uB2E4."
  },
  {
    id: "yeongdo",
    name: "\uC601\uB3C4 \uD770\uC5EC\uC6B8\uBB38\uD654\uB9C8\uC744 & \uBD09\uC0B0\uB9C8\uC744",
    subName: "\uC808\uC601\uD574\uC548 \uC808\uBCBD\uACFC \uC0B0\uBCF5\uB3C4\uB85C\uC758 \uB3C4\uC2DC\uC7AC\uC0DD \uACE8\uBAA9",
    badge: "\uBC14\uB2E4\uBDF0 / \uB808\uD2B8\uB85C \uD790\uB9C1",
    tagline: "\uC601\uD654 \uBCC0\uD638\uC778\uC758 \uCD2C\uC601\uC9C0\uC774\uC790 \uC808\uC601\uD574\uC548\uC744 \uD488\uC740 \uD574\uC548 \uC808\uBCBD \uACE8\uBAA9",
    description: "\uD53C\uB780\uBBFC\uB4E4\uC758 \uC560\uD658\uC774 \uB2F4\uAE34 \uC881\uC740 \uACE8\uBAA9 \uACC4\uB2E8\uAE38\uACFC \uD478\uB978 \uB0A8\uD56D \uBC14\uB2E4\uAC00 \uB9CC\uB098\uB294 \uAC10\uC131 \uC0B0\uCC45\uB85C\uC785\uB2C8\uB2E4. \uBE48\uC9D1\uC744 \uC608\uC220\uACF5\uAC04\uC73C\uB85C \uD0C8\uBC14\uAFC8\uD55C \uBD09\uC0B0\uB9C8\uC744\uB3C4 \uAC00\uAE5D\uC2B5\uB2C8\uB2E4.",
    themeTags: ["\uD574\uC548\uC808\uBCBD", "\uBC14\uB2E4\uC804\uB9DD\uCE74\uD398", "\uC601\uD654\uCD2C\uC601\uC9C0", "\uACE8\uBAA9\uB178\uD3EC"],
    emoji: "\u{1F30A}",
    accentColor: "#3d5a80",
    theme: "ocean_healing",
    recommendedBudgetMin: 2e4,
    recommendedBudgetMax: 45e3,
    subwayStation: "\uB0A8\uD3EC\uC5ED (1\uD638\uC120) 6\uBC88 \uCD9C\uAD6C\uC5D0\uC11C \uC601\uB3C4\uD589 \uC2DC\uB0B4\uBC84\uC2A4(7, 71, 508\uBC88) \uD658\uC2B9 10\uBD84",
    localTip: "\uD770\uC5EC\uC6B8\uB9C8\uC744\uC740 \uACC4\uB2E8\uC774 \uB9CE\uC73C\uBBC0\uB85C \uD3B8\uC548\uD55C \uC6B4\uB3D9\uD654\uB97C \uCC29\uC6A9\uD558\uACE0, \uB2A6\uC740 \uC624\uD6C4 \uC77C\uBAB0 \uC2DC\uAC04\uC5D0 \uB9DE\uCDB0 \uBC29\uBB38\uD558\uBA74 \uD658\uC0C1\uC801\uC785\uB2C8\uB2E4."
  },
  {
    id: "haeridan",
    name: "\uD574\uC6B4\uB300 \uD574\uB9AC\uB2E8\uAE38 & \uAD6C \uB3D9\uD574\uB0A8\uBD80\uC120 \uCCA0\uAE38",
    subName: "\uC61B \uD574\uC6B4\uB300 \uAE30\uCC28\uC5ED \uB4A4\uD3B8 7080 \uC8FC\uD0DD\uAC00 \uACE8\uBAA9",
    badge: "\uC544\uAE30\uC790\uAE30 / \uBE0C\uB7F0\uCE58 & \uBBF8\uC2DD",
    tagline: "\uAE30\uCC28\uAC00 \uBA48\uCD98 \uD3D0\uC120\uB85C \uB4A4\uD3B8, 7080 \uC8FC\uD0DD\uC774 \uAC10\uC131 \uC20D\uC73C\uB85C \uBCC0\uC2E0\uD55C \uAE38",
    description: "\uC61B \uD574\uC6B4\uB300\uC5ED\uC0AC \uB4A4\uD3B8\uC758 \uC870\uC6A9\uD55C \uC8FC\uD0DD\uB4E4\uC774 \uAC1C\uC131 \uC788\uB294 \uC77C\uC2DD, \uBE0C\uB7F0\uCE58, \uAD6C\uC6C0\uACFC\uC790 \uC804\uBB38\uC810\uC73C\uB85C \uBCC0\uC2E0\uD558\uC5EC \uD574\uC6B4\uB300 \uBC31\uC0AC\uC7A5\uACFC\uB294 \uB610 \uB2E4\uB978 \uC544\uB291\uD568\uC744 \uC120\uC0AC\uD569\uB2C8\uB2E4.",
    themeTags: ["\uAC10\uC131\uC8FC\uD0DD\uAC1C\uC870", "\uBE0C\uB7F0\uCE58\uB2E4\uC774\uB2DD", "\uCCA0\uAE38\uACF5\uC6D0\uC0B0\uCC45", "\uAD6C\uC6C0\uACFC\uC790"],
    emoji: "\u{1F33F}",
    accentColor: "#2a9d8f",
    theme: "cafe_dessert",
    recommendedBudgetMin: 25e3,
    recommendedBudgetMax: 55e3,
    subwayStation: "\uD574\uC6B4\uB300\uC5ED (2\uD638\uC120) 4\uBC88 \uCD9C\uAD6C \uB3C4\uBCF4 2\uBD84",
    localTip: "\uD574\uB9AC\uB2E8\uAE38 \uC911\uC2EC \uACE8\uBAA9\uC740 \uCC28\uB7C9 \uD1B5\uD589\uC774 \uC801\uC5B4 \uB3C4\uBCF4 \uC0B0\uCC45\uC5D0 \uCD5C\uC801\uC774\uBA70, \uBBF8\uD3EC \uCCA0\uAE38 \uADF8\uB9B0\uC6E8\uC774\uC640 \uC5F0\uACB0\uB429\uB2C8\uB2E4."
  },
  {
    id: "bosu",
    name: "\uB0A8\uD3EC \uBCF4\uC218\uB3D9 \uCC45\uBC29\uACE8\uBAA9 & \uBD80\uD3C9 \uAE61\uD1B5\uACE8\uBAA9",
    subName: "\uD5CC\uCC45\uC758 \uD5A5\uAE30\uC640 70\uB144 \uC804\uD1B5\uC758 \uB85C\uCEEC \uBBF8\uC2DD \uACE8\uBAA9",
    badge: "\uC544\uB0A0\uB85C\uADF8 \uB808\uD2B8\uB85C / \uB178\uD3EC \uBBF8\uC2DD",
    tagline: "6.25 \uD53C\uB780 \uC218\uB3C4\uC758 \uC5ED\uC0AC\uC640 \uC815\uCDE8\uB97C \uAC04\uC9C1\uD55C \uD5CC\uCC45\uC758 \uC232\uACFC \uBA39\uAC70\uB9AC",
    description: "\uC190\uB54C \uBB3B\uC740 \uD5CC\uCC45\uBC29\uB4E4\uC774 \uACC4\uB2E8\uC2DD\uC73C\uB85C \uB298\uC5B4\uC120 \uBCF4\uC218\uB3D9 \uCC45\uBC29\uACE8\uBAA9\uACFC \uBC31\uC885\uC6D0\uC758 3\uB300\uCC9C\uC655\uC73C\uB85C \uC720\uBA85\uD55C \uBD80\uD3C9 \uAE61\uD1B5\uC57C\uC2DC\uC7A5\uC758 \uBA39\uAC70\uB9AC \uACE8\uBAA9\uC774 \uBC14\uB85C \uC774\uC5B4\uC9D1\uB2C8\uB2E4.",
    themeTags: ["\uD5CC\uCC45\uBC29\uBCF4\uBB3C\uCC3E\uAE30", "\uBE44\uBE54\uB2F9\uBA74", "\uC720\uBD80\uC804\uACE8", "\uADFC\uD604\uB300\uC5ED\uC0AC"],
    emoji: "\u{1F4DA}",
    accentColor: "#c97a3e",
    theme: "retro_culture",
    recommendedBudgetMin: 18e3,
    recommendedBudgetMax: 4e4,
    subwayStation: "\uC790\uAC08\uCE58\uC5ED (1\uD638\uC120) 7\uBC88 \uCD9C\uAD6C / \uB0A8\uD3EC\uC5ED 1\uBC88 \uCD9C\uAD6C \uB3C4\uBCF4 8\uBD84",
    localTip: "\uD5CC\uCC45\uBC29 \uACE8\uBAA9\uC5D0\uC11C\uB294 \uC808\uD310\uB41C \uC2DC\uC9D1\uC774\uB098 \uACE0\uC11C\uC801\uC744 3,000~5,000\uC6D0\uB300 \uCC29\uD55C \uAC00\uACA9\uC5D0 \uB4DD\uD15C\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
  },
  {
    id: "mangmi",
    name: "\uC218\uC601 \uB9DD\uBBF8\uB2E8\uAE38 & F1963 \uBB38\uD654\uACE8\uBAA9",
    subName: "\uC61B \uC640\uC774\uC5B4 \uACF5\uC7A5\uC758 \uBD80\uD65C\uACFC \uC870\uC6A9\uD55C \uC8FC\uD0DD\uAC00 \uACE8\uBAA9",
    badge: "\uBCF5\uD569\uBB38\uD654\uACF5\uAC04 / \uBD81\uCE74\uD398",
    tagline: "\uC870\uC6A9\uD55C \uC8FC\uD0DD\uAC00 \uACE8\uBAA9 \uC0AC\uC774\uC0AC\uC774 \uC228\uACA8\uC9C4 \uACF5\uBC29\uACFC \uBCF5\uD569\uBB38\uD654\uACF5\uAC04",
    description: "\uACE0\uB824\uC81C\uAC15\uC758 \uC61B \uC640\uC774\uC5B4 \uACF5\uC7A5\uC744 \uB9AC\uB178\uBCA0\uC774\uC158\uD55C F1963\uC758 \uB300\uD615 \uC11C\uC810 \uBC0F \uC804\uC2DC\uC640 \uD568\uAED8, \uC8FC\uD0DD\uAC00 \uACE8\uBAA9\uC758 \uC791\uC740 \uB3C4\uC790\uAE30 \uACF5\uBC29, \uC2A4\uD398\uC15C\uD2F0 \uB85C\uC2A4\uD130\uB9AC\uAC00 \uC5B4\uC6B0\uB7EC\uC9D1\uB2C8\uB2E4.",
    themeTags: ["\uB3C4\uC2DC\uC7AC\uC0DD\uBB38\uD654", "\uB300\uD615\uBD81\uCE74\uD398", "\uC8FC\uD0DD\uAC00\uC870\uC6A9\uD55C\uCE74\uD398", "\uAC24\uB7EC\uB9AC\uD22C\uC5B4"],
    emoji: "\u{1F3A8}",
    accentColor: "#457b9d",
    theme: "retro_culture",
    recommendedBudgetMin: 22e3,
    recommendedBudgetMax: 5e4,
    subwayStation: "\uB9DD\uBBF8\uC5ED (3\uD638\uC120) 2\uBC88 \uCD9C\uAD6C / \uC218\uC601\uC5ED (2\xB73\uD638\uC120)",
    localTip: "F1963 \uB0B4\uBD80 \uC911\uC815(\uB300\uB098\uBB34 \uC232 \uC815\uC6D0)\uACFC \uD604\uB300\uBAA8\uD130\uC2A4\uD29C\uB514\uC624 \uC804\uC2DC\uB294 \uBB34\uB8CC\uB85C \uAD00\uB78C\uD560 \uC218 \uC788\uC5B4 \uAC00\uC131\uBE44\uAC00 \uB9E4\uC6B0 \uB6F0\uC5B4\uB0A9\uB2C8\uB2E4."
  }
];
var SPOTS_DATA = [
  // ==================== 1. 전포 카페거리 (jeonpo) ====================
  // 식비
  {
    id: "jp-f1",
    districtId: "jeonpo",
    name: "\uC804\uD3EC \uB1E8\uB07C\uC2DD\uB2F9 & \uD30C\uC2A4\uD0C0",
    category: "food",
    price: 13500,
    estimatedTimeMinutes: 60,
    summary: "\uCAC0\uB4DD\uD55C \uD2B8\uB7EC\uD50C \uD06C\uB9BC \uB1E8\uB07C\uC640 \uBC14\uC9C8 \uD30C\uC2A4\uD0C0\uB85C \uC720\uBA85\uD55C \uC804\uD3EC \uACE8\uBAA9 \uB300\uD45C \uC591\uC2DD\uB2F9",
    signature: "\uD2B8\uB7EC\uD50C \uD06C\uB9BC \uAC10\uC790 \uB1E8\uB07C (13,500\uC6D0)",
    tags: ["\uD2B8\uB7EC\uD50C\uB1E8\uB07C", "\uC0DD\uBA74\uD30C\uC2A4\uD0C0", "\uAC10\uC131\uACE8\uBAA9"],
    address: "\uBD80\uC0B0 \uBD80\uC0B0\uC9C4\uAD6C \uC804\uD3EC\uB300\uB85C 209\uBC88\uAE38 17",
    naverSearchUrl: "https://map.naver.com/p/search/\uC804\uD3EC \uB1E8\uB07C",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC804\uD3EC \uB1E8\uB07C",
    tip: "\uC8FC\uB9D0 \uC6E8\uC774\uD305\uC774 \uC788\uC744 \uC218 \uC788\uC73C\uB2C8 \uC810\uC2EC \uC624\uD508 11:30 \uBC29\uBB38\uC744 \uAD8C\uC7A5\uD569\uB2C8\uB2E4."
  },
  {
    id: "jp-f2",
    districtId: "jeonpo",
    name: "\uC804\uD3EC \uBC29\uC557\uAC04 \uB5A1\uBCF6\uC774 & \uC218\uC81C\uD280\uAE40",
    category: "food",
    price: 8500,
    estimatedTimeMinutes: 45,
    summary: "\uAC00\uB798\uB5A1 \uC989\uC11D \uB5A1\uBCF6\uC774\uC640 \uCC28\uB3CC\uBC15\uC774 \uD1A0\uD551\uC758 \uD658\uC0C1 \uAD81\uD569 \uB178\uD3EC \uAC10\uC131 \uBD84\uC2DD",
    signature: "\uCC28\uB3CC \uC989\uC11D \uB5A1\uBCF6\uC774 1\uC778\uBD84 & \uBAA8\uB460\uD280\uAE40 (8,500\uC6D0)",
    tags: ["\uAC00\uC131\uBE44\uC2DD\uC0AC", "\uC989\uC11D\uB5A1\uBCF6\uC774", "\uB808\uD2B8\uB85C\uBD84\uC2DD"],
    address: "\uBD80\uC0B0 \uBD80\uC0B0\uC9C4\uAD6C \uB3D9\uC131\uB85C 25",
    naverSearchUrl: "https://map.naver.com/p/search/\uC804\uD3EC \uBC29\uC557\uAC04",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC804\uD3EC \uBC29\uC557\uAC04",
    tip: "\uC608\uC0B0 \uC808\uC57D\uD615 \uCF54\uC2A4\uC5D0 \uAC00\uC7A5 \uC778\uAE30 \uC788\uB294 \uC54C\uB730 \uB4E0\uB4E0 \uB9DB\uC9D1\uC785\uB2C8\uB2E4."
  },
  {
    id: "jp-f3",
    districtId: "jeonpo",
    name: "\uAD6C \uACF5\uAD6C\uC0C1\uAC00 \uBAA9\uC7AC\uCE74\uCE20 (\uB3D9\uC9C4\uCE74\uCE20)",
    category: "food",
    price: 12e3,
    estimatedTimeMinutes: 50,
    summary: "\uB450\uD23C\uD55C \uAD6D\uB0B4\uC0B0 \uD55C\uB3C8\uC744 200\uC2DC\uAC04 \uC800\uC628 \uC219\uC131\uD574 \uD280\uACA8\uB0B8 \uBC14\uC0AD\uD55C \uC815\uD1B5 \uB3C8\uCE74\uCE20",
    signature: "\uD2B9 \uB85C\uC2A4\uCE74\uCE20 \uC815\uC2DD (12,000\uC6D0)",
    tags: ["\uC219\uC131\uB3C8\uCE74\uCE20", "\uACF5\uAD6C\uACE8\uBAA9\uC2DD\uB2F9", "\uAC89\uBC14\uC18D\uCD09"],
    address: "\uBD80\uC0B0 \uBD80\uC0B0\uC9C4\uAD6C \uC804\uD3EC\uB300\uB85C 175\uBC88\uAE38 12",
    naverSearchUrl: "https://map.naver.com/p/search/\uC804\uD3EC \uB3C8\uCE74\uCE20",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC804\uD3EC \uB3C8\uCE74\uCE20",
    tip: "\uBC25\uACFC \uC7A5\uAD6D\uC774 \uB9AC\uD544\uB418\uC5B4 \uB4E0\uB4E0\uD55C \uD55C \uB07C \uC2DD\uC0AC\uB85C \uCD5C\uACE0\uC785\uB2C8\uB2E4."
  },
  // 카페
  {
    id: "jp-c1",
    districtId: "jeonpo",
    name: "\uBCA0\uB974\uD06C \uB85C\uC2A4\uD130\uC2A4 (WERK)",
    category: "cafe",
    price: 6e3,
    estimatedTimeMinutes: 50,
    summary: "\uC804\uD3EC \uACF5\uAD6C\uACE8\uBAA9\uC744 \uC138\uACC4\uC801\uC778 \uCEE4\uD53C \uAC70\uB9AC\uB85C \uC54C\uB9B0 \uC2A4\uD398\uC15C\uD2F0 \uCEE4\uD53C\uC758 \uC815\uC218",
    signature: "\uC5D0\uD2F0\uC624\uD53C\uC544 \uB0B4\uCD94\uB7F4 \uC2F1\uAE00\uC624\uB9AC\uC9C4 \uB4DC\uB9BD (6,000\uC6D0)",
    tags: ["\uC2A4\uD398\uC15C\uD2F0\uCEE4\uD53C", "\uC9C0\uD558\uB85C\uC2A4\uD305\uB8F8", "\uC6D0\uB450\uC2DC\uC74C"],
    address: "\uBD80\uC0B0 \uBD80\uC0B0\uC9C4\uAD6C \uC11C\uC804\uB85C 58\uBC88\uAE38 115",
    naverSearchUrl: "https://map.naver.com/p/search/\uBCA0\uB974\uD06C \uB85C\uC2A4\uD130\uC2A4",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uBCA0\uB974\uD06C \uB85C\uC2A4\uD130\uC2A4",
    tip: "\uC9C0\uD558 1\uCE35 \uAD50\uD68C \uC758\uC790 \uC2A4\uD0C0\uC77C\uC758 \uAC10\uAC01\uC801\uC778 \uACF5\uAC04\uC5D0\uC11C \uCEE4\uD53C \uD5A5\uC744 \uC74C\uBBF8\uD574\uBCF4\uC138\uC694."
  },
  {
    id: "jp-c2",
    districtId: "jeonpo",
    name: "\uB355\uC988 \uBCA0\uC774\uCEE4\uB9AC (Duckz)",
    category: "cafe",
    price: 6500,
    estimatedTimeMinutes: 45,
    summary: "\uD504\uB791\uC2A4\uC0B0 \uCD5C\uACE0\uAE09 \uBC84\uD130\uB85C \uAD6C\uC6CC\uB0B8 \uD53C\uC2A4\uD0C0\uCE58\uC624 \uD06C\uB8E8\uC544\uC0C1\uACFC \uBC14\uB2D0\uB77C\uBE48 \uB77C\uB5BC",
    signature: "\uD53C\uC2A4\uD0C0\uCE58\uC624 \uD038\uC544\uB9DD & \uC544\uC774\uC2A4 \uC544\uBA54\uB9AC\uCE74\uB178 (6,500\uC6D0)",
    tags: ["\uD06C\uB8E8\uC544\uC0C1\uB9DB\uC9D1", "\uAD6C\uC6C0\uACFC\uC790", "\uC544\uB2F4\uD55C\uCE74\uD398"],
    address: "\uBD80\uC0B0 \uBD80\uC0B0\uC9C4\uAD6C \uB3D9\uC131\uB85C 39",
    naverSearchUrl: "https://map.naver.com/p/search/\uC804\uD3EC \uB355\uC988 \uBCA0\uC774\uCEE4\uB9AC",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC804\uD3EC \uB355\uC988 \uBCA0\uC774\uCEE4\uB9AC"
  },
  {
    id: "jp-c3",
    districtId: "jeonpo",
    name: "\uC0EC\uB86F \uC804\uD3EC (Charlotte)",
    category: "cafe",
    price: 7e3,
    estimatedTimeMinutes: 50,
    summary: "\uC720\uB7FD\uD48D \uB178\uCC9C\uCE74\uD398 \uAC10\uC131\uACFC \uAC13 \uAD6C\uC6B4 \uBE0C\uB77C\uC6B4\uCE58\uC988 \uD06C\uB85C\uD50C\uC758 \uBA85\uC18C",
    signature: "\uBE0C\uB77C\uC6B4 \uCE58\uC988 \uD06C\uB85C\uD50C 1p & \uD50C\uB7AB\uD654\uC774\uD2B8 (7,000\uC6D0)",
    tags: ["\uC720\uB7FD\uAC10\uC131", "\uBE0C\uB77C\uC6B4\uCE58\uC988\uD06C\uB85C\uD50C", "\uACE8\uBAA9\uD14C\uB77C\uC2A4"],
    address: "\uBD80\uC0B0 \uBD80\uC0B0\uC9C4\uAD6C \uC11C\uC804\uB85C 37\uBC88\uAE38 20",
    naverSearchUrl: "https://map.naver.com/p/search/\uC0EC\uB86F \uC804\uD3EC",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC0EC\uB86F \uC804\uD3EC"
  },
  // 입장/체험/문화
  {
    id: "jp-a1",
    districtId: "jeonpo",
    name: "\uC804\uD3EC \uC18C\uD488\uC0F5 & \uB3C5\uB9BD\uBB38\uAD6C \uC544\uCE74\uC774\uBE0C \uD22C\uC5B4",
    category: "admission",
    price: 5e3,
    estimatedTimeMinutes: 40,
    summary: "\uACE8\uBAA9 \uACF3\uACF3\uC758 \uCCAD\uB144 \uB514\uC790\uC774\uB108 \uD3B8\uC9D1\uC20D(\uD398\uC774\uD37C\uAC00\uB4E0, \uBA54\uC6D4 \uB4F1) \uAC10\uC131 \uAD7F\uC988/\uC5FD\uC11C \uC18C\uC7A5",
    signature: "\uBD80\uC0B0 \uACE8\uBAA9 \uC77C\uB7EC\uC2A4\uD2B8 \uC5FD\uC11C & \uB9C8\uC2A4\uD0B9\uD14C\uC774\uD504 \uAD7F\uC988 \uAD6C\uB9E4 (5,000\uC6D0)",
    tags: ["\uBB38\uAD6C\uB355\uD6C4", "\uB3C5\uB9BD\uC18C\uD488\uC0F5", "\uACE8\uBAA9\uC0B0\uCC45"],
    address: "\uBD80\uC0B0 \uBD80\uC0B0\uC9C4\uAD6C \uC804\uD3EC\uB300\uB85C 223\uBC88\uAE38 \uC77C\uB300",
    naverSearchUrl: "https://map.naver.com/p/search/\uC804\uD3EC \uC18C\uD488\uC0F5",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC804\uD3EC \uC18C\uD488\uC0F5",
    tip: "\uC785\uC7A5\uB8CC\uB294 \uBB34\uB8CC\uC774\uBA70, \uB9C8\uC74C\uC5D0 \uB4DC\uB294 \uB85C\uCEEC \uAD7F\uC988 1~2\uAC1C \uAD6C\uB9E4 \uBE44\uC6A9\uC785\uB2C8\uB2E4."
  },
  {
    id: "jp-a2",
    districtId: "jeonpo",
    name: "\uC804\uD3EC \uBC14\uC774\uB2D0 \uB808\uCF54\uB4DC \uCCAD\uC74C \uB77C\uC6B4\uC9C0",
    category: "admission",
    price: 0,
    isFree: true,
    estimatedTimeMinutes: 30,
    summary: "\uC544\uB0A0\uB85C\uADF8 LP \uB808\uCF54\uB4DC\uD310\uC744 \uC9C1\uC811 \uD134\uD14C\uC774\uBE14\uC5D0 \uC5B9\uC5B4 \uBB34\uB8CC\uB85C \uCCAD\uC74C\uD558\uB294 \uD790\uB9C1 \uACF5\uAC04",
    signature: "\uD074\uB798\uC2DD \uC2DC\uD2F0\uD31D & \uC7AC\uC988 LP \uBB34\uB8CC \uCCAD\uC74C (0\uC6D0)",
    tags: ["\uBB34\uB8CC\uCCB4\uD5D8", "LP\uCCAD\uC74C", "\uC544\uB0A0\uB85C\uADF8\uAC10\uC131"],
    address: "\uBD80\uC0B0 \uBD80\uC0B0\uC9C4\uAD6C \uC804\uD3EC\uB300\uB85C 186\uBC88\uAE38 8",
    naverSearchUrl: "https://map.naver.com/p/search/\uC804\uD3EC LP \uB808\uCF54\uB4DC",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC804\uD3EC LP \uB808\uCF54\uB4DC"
  },
  {
    id: "jp-a3",
    districtId: "jeonpo",
    name: "\uC804\uD3EC \uACE8\uBAA9 \uAC00\uC8FD\uACF5\uBC29 \uC6D0\uB370\uC774 \uD0A4\uB9C1",
    category: "admission",
    price: 14e3,
    estimatedTimeMinutes: 60,
    summary: "\uC774\uD0DC\uB9AC \uBCA0\uC9C0\uD130\uBE14 \uCC9C\uC5F0 \uAC00\uC8FD\uC5D0 \uC774\uB2C8\uC15C\uC744 \uAC01\uC778\uD558\uB294 \uB098\uB9CC\uC758 \uC5EC\uD589 \uAE30\uB150\uD488 \uB9CC\uB4E4\uAE30",
    signature: "\uD578\uB4DC\uBA54\uC774\uB4DC \uC774\uB2C8\uC15C \uAC01\uC778 \uAC00\uC8FD \uD0A4\uB9C1 \uC81C\uC791 (14,000\uC6D0)",
    tags: ["\uC6D0\uB370\uC774\uD074\uB798\uC2A4", "\uAC00\uC8FD\uACF5\uC608", "\uAE30\uB150\uD488"],
    address: "\uBD80\uC0B0 \uBD80\uC0B0\uC9C4\uAD6C \uB3D9\uC131\uB85C 15\uBC88\uAE38 3",
    naverSearchUrl: "https://map.naver.com/p/search/\uC804\uD3EC \uAC00\uC8FD\uACF5\uBC29",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC804\uD3EC \uAC00\uC8FD\uACF5\uBC29"
  },
  // 간식
  {
    id: "jp-s1",
    districtId: "jeonpo",
    name: "\uC804\uD3EC \uC300 \uC528\uC557\uD638\uB5A1",
    category: "snack",
    price: 2500,
    estimatedTimeMinutes: 15,
    summary: "\uAC89\uC740 \uBC14\uC0AD\uD558\uACE0 \uC18D\uC740 \uACAC\uACFC\uB958\uC640 \uD751\uC124\uD0D5 \uAFC0\uB85C \uAF49 \uCC2C \uC989\uC11D \uC300\uD638\uB5A1",
    signature: "\uAC13 \uAD6C\uC6B4 \uC300 \uC528\uC557\uD638\uB5A1 (2,500\uC6D0)",
    tags: ["\uAE38\uAC70\uB9AC\uAC04\uC2DD", "\uC528\uC557\uD638\uB5A1", "\uB2EC\uCF64\uD568"],
    address: "\uBD80\uC0B0 \uBD80\uC0B0\uC9C4\uAD6C \uC804\uD3EC\uB3D9 340",
    naverSearchUrl: "https://map.naver.com/p/search/\uC804\uD3EC \uD638\uB5A1",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC804\uD3EC \uD638\uB5A1"
  },
  // ==================== 2. 영도 흰여울문화마을 & 봉산마을 (yeongdo) ====================
  // 식비
  {
    id: "yd-f1",
    districtId: "yeongdo",
    name: "\uC601\uB3C4 \uD574\uB140\uAE40\uBC25 & \uB561\uCD08\uD574\uBB3C\uB77C\uBA74",
    category: "food",
    price: 8500,
    estimatedTimeMinutes: 45,
    summary: "\uBC14\uB2E4 \uBC14\uB85C \uC55E \uD30C\uB3C4 \uC18C\uB9AC\uB97C \uB4E4\uC73C\uBA70 \uB9DB\uBCF4\uB294 \uC601\uB3C4 \uD2B9\uC0B0 \uD574\uCD08\uAE40\uBC25\uACFC \uC5BC\uD070 \uD574\uBB3C\uB77C\uBA74",
    signature: "\uD574\uB140 \uD1B3\uAE40\uBC25 & \uCE7C\uCE7C \uD574\uBB3C\uB77C\uBA74 (8,500\uC6D0)",
    tags: ["\uC601\uB3C4\uBC14\uB2E4\uBDF0", "\uD1B3\uAE40\uBC25", "\uD574\uBB3C\uB77C\uBA74"],
    address: "\uBD80\uC0B0 \uC601\uB3C4\uAD6C \uC808\uC601\uB85C 204",
    naverSearchUrl: "https://map.naver.com/p/search/\uC601\uB3C4 \uD574\uB140\uAE40\uBC25",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC601\uB3C4 \uD574\uB140\uAE40\uBC25",
    tip: "\uC57C\uC678 \uD50C\uB77C\uC2A4\uD2F1 \uD3C9\uC0C1 \uC790\uB9AC\uC5D0 \uC549\uC73C\uBA74 \uBC14\uB2E4\uAC00 \uBC14\uB85C \uBC1C\uC544\uB798 \uD3BC\uCCD0\uC9D1\uB2C8\uB2E4."
  },
  {
    id: "yd-f2",
    districtId: "yeongdo",
    name: "\uBD09\uB798\uB3D9 \uACE8\uBAA9 \uC654\uB2E4\uC2DD\uB2F9 (\uC2A4\uC9C0\uC804\uACE8)",
    category: "food",
    price: 11e3,
    estimatedTimeMinutes: 50,
    summary: "\uBD80\uC0B0 \uC601\uB3C4 \uC870\uC120\uC18C \uB178\uB3D9\uC790\uB4E4\uC758 \uC6D0\uAE30\uB97C \uBD81\uB3CB\uC6B0\uB358 40\uB144 \uC804\uD1B5 \uD55C\uC6B0 \uC2A4\uC9C0\uB41C\uC7A5\uCC0C\uAC1C",
    signature: "\uB9D1\uC740 \uD55C\uC6B0 \uC2A4\uC9C0\uC218\uC721 \uC804\uACE8 \uBC31\uBC18 (11,000\uC6D0)",
    tags: ["40\uB144\uC804\uD1B5", "\uC2A4\uC9C0\uB41C\uC7A5\uC804\uACE8", "\uB85C\uCEEC\uB178\uD3EC"],
    address: "\uBD80\uC0B0 \uC601\uB3C4\uAD6C \uD558\uB098\uAE38 811",
    naverSearchUrl: "https://map.naver.com/p/search/\uC601\uB3C4 \uC654\uB2E4\uC2DD\uB2F9",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC601\uB3C4 \uC654\uB2E4\uC2DD\uB2F9"
  },
  {
    id: "yd-f3",
    districtId: "yeongdo",
    name: "\uD770\uC5EC\uC6B8 \uC810\uBE75 (\uBC14\uB2E4\uBDF0 \uB0C4\uBE44\uB77C\uBA74 & \uD1A0\uC2A4\uD2B8)",
    category: "food",
    price: 6e3,
    estimatedTimeMinutes: 40,
    summary: "\uB9C8\uC744 \uC5B4\uB974\uC2E0\uB4E4\uC774 \uB053\uC5EC\uC8FC\uC2DC\uB294 \uC591\uC740\uB0C4\uBE44 \uB77C\uBA74\uACFC \uB2EC\uCF64\uD55C \uC124\uD0D5 \uACC4\uB780\uD1A0\uC2A4\uD2B8",
    signature: "\uCC3D\uAC00 \uBC14\uB2E4\uBDF0 \uB0C4\uBE44\uB77C\uBA74 (6,000\uC6D0)",
    tags: ["\uCD08\uAC00\uC131\uBE44", "\uC624\uC158\uBDF0\uC2DD\uC0AC", "\uB9C8\uC744\uD611\uB3D9\uC870\uD569"],
    address: "\uBD80\uC0B0 \uC601\uB3C4\uAD6C \uC808\uC601\uB85C 244",
    naverSearchUrl: "https://map.naver.com/p/search/\uD770\uC5EC\uC6B8\uC810\uBE75",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uD770\uC5EC\uC6B8\uC810\uBE75"
  },
  // 카페
  {
    id: "yd-c1",
    districtId: "yeongdo",
    name: "\uC190\uBAA9\uC11C\uAC00 (\uB3C5\uB9BD\uC11C\uC810 & \uBC14\uB2E4\uCE74\uD398)",
    category: "cafe",
    price: 7e3,
    estimatedTimeMinutes: 60,
    summary: "\uD30C\uB3C4\uCE58\uB294 \uD574\uC548 \uC808\uBCBD \uACE8\uBAA9\uC5D0 \uC704\uCE58\uD55C \uC2DC\uC778 \uBD80\uBD80\uC758 \uAC10\uC131 \uB3C5\uB9BD\uC11C\uC810\uC774\uC790 \uD578\uB4DC\uB4DC\uB9BD \uCE74\uD398",
    signature: "\uC5D0\uD2F0\uC624\uD53C\uC544 \uD578\uB4DC\uB4DC\uB9BD & \uC218\uC81C \uAE00\uB93C\uBC14\uC778 (7,000\uC6D0)",
    tags: ["\uB3C5\uB9BD\uC11C\uC810", "\uC624\uC158\uBDF0\uCC3D\uAC00", "\uC2DC\uC9D1\uB0AD\uB3C5"],
    address: "\uBD80\uC0B0 \uC601\uB3C4\uAD6C \uD770\uC5EC\uC6B8\uAE38 307",
    naverSearchUrl: "https://map.naver.com/p/search/\uC190\uBAA9\uC11C\uAC00",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC190\uBAA9\uC11C\uAC00",
    tip: "2\uCE35 \uCC3D\uAC00 \uC790\uB9AC\uB294 \uBD80\uC0B0 \uCD5C\uACE0\uC758 \uBC14\uB2E4 \uC561\uC790 \uBDF0\uB85C \uAF3D\uD799\uB2C8\uB2E4."
  },
  {
    id: "yd-c2",
    districtId: "yeongdo",
    name: "\uCE74\uD398 \uC5D0\uD14C\uB974 (AETHER)",
    category: "cafe",
    price: 7500,
    estimatedTimeMinutes: 50,
    summary: "\uD770\uC5EC\uC6B8 \uC808\uBCBD \uC704\uC5D0 \uC138\uC6CC\uC9C4 \uD604\uB300 \uAC74\uCD95\uC758 \uBBF8\uD559, \uD30C\uB178\uB77C\uB9C8 \uBC14\uB2E4 \uC870\uB9DD \uB8E8\uD504\uD0D1",
    signature: "\uC5D0\uD14C\uB974 \uC624\uC158 \uC194\uD2B8 \uC544\uC778\uC288\uD398\uB108 (7,500\uC6D0)",
    tags: ["\uD30C\uB178\uB77C\uB9C8\uC624\uC158\uBDF0", "\uB8E8\uD504\uD0D1\uD3EC\uD1A0\uC874", "\uC194\uD2B8\uCEE4\uD53C"],
    address: "\uBD80\uC0B0 \uC601\uB3C4\uAD6C \uC808\uC601\uB85C 226",
    naverSearchUrl: "https://map.naver.com/p/search/\uCE74\uD398 \uC5D0\uD14C\uB974 \uC601\uB3C4",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uCE74\uD398 \uC5D0\uD14C\uB974 \uC601\uB3C4"
  },
  {
    id: "yd-c3",
    districtId: "yeongdo",
    name: "\uC2E0\uAE30\uC232 (\uC2E0\uAE30\uC0B0\uC5C5 \uB300\uB098\uBB34 \uC232\uC18D \uCE74\uD398)",
    category: "cafe",
    price: 6500,
    estimatedTimeMinutes: 50,
    summary: "\uC601\uB3C4 \uBD09\uB798\uC0B0 \uC790\uB77D, \uB300\uB098\uBB34 \uC232\uACFC \uC624\uB798\uB41C \uBAA9\uC870 \uAC00\uC625\uC774 \uC8FC\uB294 \uC644\uBCBD\uD55C \uC815\uC801\uACFC \uD734\uC2DD",
    signature: "\uB354\uD2F0 \uC465 \uB77C\uB5BC & \uBC14\uB2D0\uB77C\uBE48 \uCF5C\uB4DC\uBE0C\uB8E8 (6,500\uC6D0)",
    tags: ["\uC232\uC18D\uCE74\uD398", "\uB178\uD0A4\uC988\uC874\uD790\uB9C1", "\uB300\uB098\uBB34\uC232"],
    address: "\uBD80\uC0B0 \uC601\uB3C4\uAD6C \uC640\uCE58\uB85C 65",
    naverSearchUrl: "https://map.naver.com/p/search/\uC601\uB3C4 \uC2E0\uAE30\uC232",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC601\uB3C4 \uC2E0\uAE30\uC232"
  },
  // 입장/체험
  {
    id: "yd-a1",
    districtId: "yeongdo",
    name: "\uC808\uC601\uD574\uC548\uC0B0\uCC45\uB85C & \uD770\uC5EC\uC6B8 \uD574\uC548\uD130\uB110",
    category: "admission",
    price: 0,
    isFree: true,
    estimatedTimeMinutes: 50,
    summary: "\uAE30\uC554\uC808\uBCBD\uACFC \uD30C\uB3C4 \uC18C\uB9AC\uB97C \uB4E4\uC73C\uBA70 \uAC77\uB294 \uD574\uC548 \uB458\uB808\uAE38 \uBC0F \uB124\uC628 \uD3EC\uD1A0\uC874 \uD574\uC548\uD130\uB110",
    signature: "\uD574\uC548\uD130\uB110 \uC2E4\uB8E8\uC5E3 \uBC14\uB2E4 \uC778\uC0DD\uC0F7 (\uBB34\uB8CC \uAD00\uB78C)",
    tags: ["\uBB34\uB8CC\uC785\uC7A5", "\uD574\uC548\uC0B0\uCC45\uB85C", "\uC778\uC0DD\uC0F7\uD3EC\uD1A0\uC874"],
    address: "\uBD80\uC0B0 \uC601\uB3C4\uAD6C \uC601\uC120\uB3D94\uAC00 1044-6",
    naverSearchUrl: "https://map.naver.com/p/search/\uD770\uC5EC\uC6B8 \uD574\uC548\uD130\uB110",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uD770\uC5EC\uC6B8 \uD574\uC548\uD130\uB110",
    tip: "\uD130\uB110 \uC785\uAD6C\uC5D0\uC11C \uC5ED\uAD11\uC73C\uB85C \uBC14\uB2E4\uB97C \uBC30\uACBD \uC0BC\uC544 \uCD2C\uC601\uD558\uBA74 \uCD5C\uACE0\uC758 \uC778\uC0DD \uC0AC\uC9C4\uC774 \uC644\uC131\uB429\uB2C8\uB2E4."
  },
  {
    id: "yd-a2",
    districtId: "yeongdo",
    name: "\uBD09\uC0B0\uB9C8\uC744 \uBE14\uB8E8\uBCA0\uB9AC \uBE48\uC9D1\uC7AC\uC0DD \uC544\uCE74\uC774\uBE0C",
    category: "admission",
    price: 0,
    isFree: true,
    estimatedTimeMinutes: 30,
    summary: "\uC8FC\uBBFC\uB4E4\uACFC \uCCAD\uB144 \uC791\uAC00\uB4E4\uC774 \uD3D0\uAC00\uB97C \uAC1C\uC870\uD574 \uB9CC\uB4E0 \uB9C8\uC744 \uAC24\uB7EC\uB9AC\uC640 \uC625\uC0C1 \uC27C\uD130",
    signature: "\uC0B0\uBCF5\uB3C4\uB85C \uB9C8\uC744 \uAC24\uB7EC\uB9AC \uC804\uC2DC \uAD00\uB78C (\uBB34\uB8CC)",
    tags: ["\uB3C4\uC2DC\uC7AC\uC0DD", "\uC0B0\uBCF5\uB3C4\uB85C\uBDF0", "\uACE8\uBAA9\uC544\uCE74\uC774\uBE0C"],
    address: "\uBD80\uC0B0 \uC601\uB3C4\uAD6C \uC0B0\uC81C\uB85C 17\uBC88\uAE38 \uC77C\uB300",
    naverSearchUrl: "https://map.naver.com/p/search/\uC601\uB3C4 \uBD09\uC0B0\uB9C8\uC744",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC601\uB3C4 \uBD09\uC0B0\uB9C8\uC744"
  },
  {
    id: "yd-a3",
    districtId: "yeongdo",
    name: "\uD770\uC5EC\uC6B8 \uBC14\uB2E4\uC720\uB9AC \uC5C5\uC0AC\uC774\uD074\uB9C1 \uB9C8\uADF8\uB137",
    category: "admission",
    price: 8e3,
    estimatedTimeMinutes: 40,
    summary: "\uBD80\uC0B0 \uD574\uBCC0\uC73C\uB85C \uBC00\uB824\uC628 \uC528\uAE00\uB77C\uC2A4(\uBC14\uB2E4 \uC720\uB9AC)\uB97C \uC5EE\uC5B4 \uB9CC\uB4DC\uB294 \uCE5C\uD658\uACBD \uB0C9\uC7A5\uACE0 \uC790\uC11D",
    signature: "\uC528\uAE00\uB77C\uC2A4 \uB9C8\uADF8\uB137 \uC81C\uC791 \uD0A4\uD2B8 \uCCB4\uD5D8 (8,000\uC6D0)",
    tags: ["\uCE5C\uD658\uACBD\uCCB4\uD5D8", "\uBC14\uB2E4\uC720\uB9AC\uACF5\uC608", "\uC601\uB3C4\uAE30\uB150\uD488"],
    address: "\uBD80\uC0B0 \uC601\uB3C4\uAD6C \uD770\uC5EC\uC6B8\uAE38 112",
    naverSearchUrl: "https://map.naver.com/p/search/\uD770\uC5EC\uC6B8 \uBC14\uB2E4\uC720\uB9AC \uACF5\uBC29",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uD770\uC5EC\uC6B8 \uBC14\uB2E4\uC720\uB9AC \uACF5\uBC29"
  },
  // 간식
  {
    id: "yd-s1",
    districtId: "yeongdo",
    name: "\uC601\uB3C4 \uC0BC\uC9C4\uC5B4\uBB35 \uBCF8\uC810 \uC218\uC81C \uC5B4\uBB35\uACE0\uB85C\uCF00",
    category: "snack",
    price: 3200,
    estimatedTimeMinutes: 20,
    summary: "1953\uB144\uBD80\uD130 \uC601\uB3C4\uC5D0\uC11C \uC2DC\uC791\uB41C \uB300\uD55C\uBBFC\uAD6D \uCD5C\uACE0(\u6700\u53E4) \uC5B4\uBB35\uC758 \uBC14\uC0AD\uD55C \uCE58\uC988 \uACE0\uB85C\uCF00",
    signature: "\uCE58\uC988 & \uB561\uCD08 \uC5B4\uBB35\uACE0\uB85C\uCF00 (3,200\uC6D0)",
    tags: ["1953\uB144\uC6D0\uC870", "\uC218\uC81C\uC5B4\uBB35\uACE0\uB85C\uCF00", "\uBD80\uC0B0\uB300\uD45C\uAC04\uC2DD"],
    address: "\uBD80\uC0B0 \uC601\uB3C4\uAD6C \uD0DC\uC885\uB85C 99\uBC88\uAE38 36",
    naverSearchUrl: "https://map.naver.com/p/search/\uC0BC\uC9C4\uC5B4\uBB35 \uC601\uB3C4\uBCF8\uC810",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC0BC\uC9C4\uC5B4\uBB35 \uC601\uB3C4\uBCF8\uC810"
  },
  // ==================== 3. 해운대 해리단길 (haeridan) ====================
  // 식비
  {
    id: "hd-f1",
    districtId: "haeridan",
    name: "\uB098\uAC00\uD558\uB9C8\uB9CC\uAC8C\uCE20 \uB77C\uBA58",
    category: "food",
    price: 11e3,
    estimatedTimeMinutes: 50,
    summary: "\uD6C4\uCFE0\uC624\uCE74 50\uB144 \uC804\uD1B5 \uC7A5\uC778\uC758 \uBE44\uBC95 \uC721\uC218\uB97C \uADF8\uB300\uB85C \uC804\uC218\uBC1B\uC740 \uD574\uB9AC\uB2E8\uAE38 \uC904\uC11C\uB294 \uB77C\uBA58",
    signature: "\uB098\uAC00\uD558\uB9C8 \uB3C8\uCF54\uCE20 \uB77C\uBA58 & \uC218\uC81C \uAD50\uC790 (11,000\uC6D0)",
    tags: ["\uC9C4\uD55C\uAD6D\uBB3C", "\uB3C8\uCF54\uCE20\uB77C\uBA58", "\uD574\uB9AC\uB2E81\uC704"],
    address: "\uBD80\uC0B0 \uD574\uC6B4\uB300\uAD6C \uC6B0\uB3D91\uB85C 57",
    naverSearchUrl: "https://map.naver.com/p/search/\uB098\uAC00\uD558\uB9C8\uB9CC\uAC8C\uCE20",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uB098\uAC00\uD558\uB9C8\uB9CC\uAC8C\uCE20",
    tip: "\uD14C\uC774\uBE14\uB9C1 \uC6D0\uACA9 \uC904\uC11C\uAE30\uAC00 \uAC00\uB2A5\uD558\uB2C8 \uCD9C\uBC1C \uC804 \uBBF8\uB9AC \uB300\uAE30\uB97C \uAC78\uC5B4\uB450\uC138\uC694."
  },
  {
    id: "hd-f2",
    districtId: "haeridan",
    name: "\uD574\uB9AC\uB2E8 \uD0C0\uC774\uD478\uB4DC (\uC6D0\uC870 \uD31F\uD0C0\uC774)",
    category: "food",
    price: 12500,
    estimatedTimeMinutes: 50,
    summary: "\uC0C8\uC6B0\uC640 \uC219\uC8FC, \uB545\uCF69\uAC00\uB8E8\uB97C \uAC15\uD55C \uBD88\uB9DB\uC73C\uB85C \uBCF6\uC544\uB0B8 \uD0DC\uAD6D \uD604\uC9C0\uC2DD \uD31F\uD0C0\uC774",
    signature: "\uC26C\uB9BC\uD504 \uD31F\uD0C0\uC774 & \uB9DD\uACE0 \uC8FC\uC2A4 \uC138\uD2B8 (12,500\uC6D0)",
    tags: ["\uBD88\uB9DB\uD31F\uD0C0\uC774", "\uAC10\uC131\uC8FC\uD0DD\uAC1C\uC870", "\uB3D9\uB0A8\uC544\uBBF8\uC2DD"],
    address: "\uBD80\uC0B0 \uD574\uC6B4\uB300\uAD6C \uC6B0\uB3D91\uB85C 38\uBC88\uAE38 15",
    naverSearchUrl: "https://map.naver.com/p/search/\uD574\uB9AC\uB2E8\uAE38 \uD31F\uD0C0\uC774",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uD574\uB9AC\uB2E8\uAE38 \uD31F\uD0C0\uC774"
  },
  {
    id: "hd-f3",
    districtId: "haeridan",
    name: "\uD574\uB9AC\uB2E8 \uC61B\uB0A0 \uC190\uCE7C\uAD6D\uC218 & \uCDA9\uBB34\uAE40\uBC25",
    category: "food",
    price: 6500,
    estimatedTimeMinutes: 40,
    summary: "\uC9C4\uD55C \uBA78\uCE58 \uB514\uD3EC\uB9AC \uC721\uC218\uC5D0 \uC190\uC73C\uB85C \uC9C1\uC811 \uBBFC \uCAC4\uAE43\uD55C \uC190\uCE7C\uAD6D\uC218\uC640 \uC624\uC9D5\uC5B4\uBB34\uCE68 \uAE40\uBC25",
    signature: "\uC190\uCE7C\uAD6D\uC218 & \uBC18\uBC18\uAE40\uBC25 (6,500\uC6D0)",
    tags: ["\uCD08\uAC00\uC131\uBE44", "\uC9C4\uD55C\uBA78\uCE58\uC721\uC218", "\uB178\uD3EC\uC190\uCE7C\uAD6D\uC218"],
    address: "\uBD80\uC0B0 \uD574\uC6B4\uB300\uAD6C \uC6B0\uB3D91\uB85C 20\uBC88\uAE38 9",
    naverSearchUrl: "https://map.naver.com/p/search/\uD574\uB9AC\uB2E8\uAE38 \uCE7C\uAD6D\uC218",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uD574\uB9AC\uB2E8\uAE38 \uCE7C\uAD6D\uC218"
  },
  // 카페
  {
    id: "hd-c1",
    districtId: "haeridan",
    name: "\uB808\uC774\uD06C \uCEE4\uD53C\uBC14 (LAKE)",
    category: "cafe",
    price: 6500,
    estimatedTimeMinutes: 50,
    summary: "\uCC28\uBD84\uD55C \uB179\uC0C9 \uD1A4\uC758 \uAC10\uC131 \uC778\uD14C\uB9AC\uC5B4\uC640 \uC218\uC81C \uB9D0\uCC28 \uD50C\uB7AB\uD654\uC774\uD2B8(\uD3EC\uB808\uC2A4\uD2B8)\uAC00 \uC2DC\uADF8\uB2C8\uCC98",
    signature: "\uD3EC\uB808\uC2A4\uD2B8 (\uB9D0\uCC28 \uC5D0\uC2A4\uD504\uB808\uC18C \uD06C\uB9BC) (6,500\uC6D0)",
    tags: ["\uB9D0\uCC28\uB77C\uB5BC", "\uBBF8\uB2C8\uBA40\uC778\uD14C\uB9AC\uC5B4", "\uD574\uB9AC\uB2E8\uAC10\uC131"],
    address: "\uBD80\uC0B0 \uD574\uC6B4\uB300\uAD6C \uC6B0\uB3D91\uB85C 38\uBC88\uAE38 12",
    naverSearchUrl: "https://map.naver.com/p/search/\uB808\uC774\uD06C \uCEE4\uD53C\uBC14",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uB808\uC774\uD06C \uCEE4\uD53C\uBC14"
  },
  {
    id: "hd-c2",
    districtId: "haeridan",
    name: "\uB4C0\uD50C\uB9BF \uD574\uB9AC\uB2E8 (Duplit)",
    category: "cafe",
    price: 6800,
    estimatedTimeMinutes: 50,
    summary: "\uBBF8\uAD6D \uC11C\uBD80 \uD734\uC591\uC9C0 \uAC10\uC131\uC758 \uC774\uAD6D\uC801\uC778 \uD14C\uB77C\uC2A4\uC640 \uBC84\uD130\uBC14, \uC625\uC218\uC218 \uCE58\uC988\uCF00\uC774\uD06C",
    signature: "\uBC84\uD130\uCAC0\uB4DD\uBC14 & \uC194\uD2F0\uB4DC \uCE74\uB77C\uBA5C \uB77C\uB5BC (6,800\uC6D0)",
    tags: ["\uC774\uAD6D\uC801\uD14C\uB77C\uC2A4", "\uBC84\uD130\uBC14\uC131\uC9C0", "\uD3EC\uD1A0\uC874\uCE74\uD398"],
    address: "\uBD80\uC0B0 \uD574\uC6B4\uB300\uAD6C \uC6B0\uB3D91\uB85C 20\uBC88\uAC00\uAE38 27-13",
    naverSearchUrl: "https://map.naver.com/p/search/\uB4C0\uD50C\uB9BF \uD574\uB9AC\uB2E8",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uB4C0\uD50C\uB9BF \uD574\uB9AC\uB2E8"
  },
  {
    id: "hd-c3",
    districtId: "haeridan",
    name: "\uD558\uB77C \uBCA0\uC774\uCEE4\uB9AC & \uD2F0\uB8F8",
    category: "cafe",
    price: 6e3,
    estimatedTimeMinutes: 45,
    summary: "\uACC4\uC808 \uACFC\uC77C \uD0C0\uB974\uD2B8\uC640 \uBD80\uB4DC\uB7EC\uC6B4 \uC6B0\uC720 \uB0C9\uCE68 \uBC00\uD06C\uD2F0\uAC00 \uC870\uD654\uB97C \uC774\uB8E8\uB294 \uC544\uB291\uD55C \uACF5\uAC04",
    signature: "\uBB34\uD654\uACFC \uD0C0\uB974\uD2B8 & \uC2DC\uADF8\uB2C8\uCC98 \uB0C9\uCE68 \uBC00\uD06C\uD2F0 (6,000\uC6D0)",
    tags: ["\uD0C0\uB974\uD2B8\uB9DB\uC9D1", "\uC870\uC6A9\uD55C\uD2F0\uB8F8", "\uAD6C\uC6C0\uACFC\uC790"],
    address: "\uBD80\uC0B0 \uD574\uC6B4\uB300\uAD6C \uC6B0\uB3D91\uB85C 38\uBC88\uAC00\uAE38 7",
    naverSearchUrl: "https://map.naver.com/p/search/\uD574\uB9AC\uB2E8 \uD558\uB77C",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uD574\uB9AC\uB2E8 \uD558\uB77C"
  },
  // 입장/체험
  {
    id: "hd-a1",
    districtId: "haeridan",
    name: "\uAD6C \uD574\uC6B4\uB300\uC5ED \uCCA0\uAE38\uACF5\uC6D0 & \uC5ED\uC0AC \uC544\uCE74\uC774\uBE0C",
    category: "admission",
    price: 0,
    isFree: true,
    estimatedTimeMinutes: 40,
    summary: "\uAE30\uCC28\uAC00 \uB2E4\uB2C8\uB358 \uD3D0\uC120\uB85C\uB97C \uB530\uB77C \uC870\uC131\uB41C \uC6B8\uCC3D\uD55C \uB3C4\uC2EC \uC232\uAE38\uACFC \uADFC\uB300 \uC5ED\uC0AC \uBCF4\uC874\uAD00",
    signature: "\uCCA0\uAE38 \uD3EC\uD1A0\uC874 & \uCCA0\uAE38\uACF5\uC6D0 \uB3C4\uBCF4 \uC0B0\uCC45 (\uBB34\uB8CC \uAD00\uB78C)",
    tags: ["\uBB34\uB8CC\uC0B0\uCC45", "\uCCA0\uAE38\uC0AC\uC9C4", "\uB3C4\uC2EC\uACF5\uC6D0"],
    address: "\uBD80\uC0B0 \uD574\uC6B4\uB300\uAD6C \uD574\uC6B4\uB300\uB85C 621",
    naverSearchUrl: "https://map.naver.com/p/search/\uD574\uC6B4\uB300 \uAD6C \uC5ED\uC0AC \uACF5\uC6D0",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uD574\uC6B4\uB300 \uAD6C \uC5ED\uC0AC \uACF5\uC6D0"
  },
  {
    id: "hd-a2",
    districtId: "haeridan",
    name: "\uD574\uB9AC\uB2E8 \uC544\uB0A0\uB85C\uADF8 \uC140\uD504 \uD751\uBC31\uC0AC\uC9C4\uAD00",
    category: "admission",
    price: 5e3,
    estimatedTimeMinutes: 20,
    summary: "\uBE48\uD2F0\uC9C0 \uAC10\uC131\uC758 \uACE0\uD654\uC9C8 \uD751\uBC31 \uC989\uC11D \uB124\uCEF7 \uD504\uB808\uC784\uC73C\uB85C \uAE30\uB85D\uD558\uB294 \uACE8\uBAA9 \uC5EC\uD589 \uCD94\uC5B5",
    signature: "\uD074\uB798\uC2DD \uD751\uBC31 4\uCEF7 \uC0AC\uC9C4 2\uB9E4 \uCD9C\uB825 (5,000\uC6D0)",
    tags: ["\uCD94\uC5B5\uAE30\uB85D", "\uB124\uCEF7\uC0AC\uC9C4", "\uD751\uBC31\uAC10\uC131"],
    address: "\uBD80\uC0B0 \uD574\uC6B4\uB300\uAD6C \uC6B0\uB3D91\uB85C 38\uBC88\uAE38 19",
    naverSearchUrl: "https://map.naver.com/p/search/\uD574\uB9AC\uB2E8 \uC140\uD504\uC0AC\uC9C4\uAD00",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uD574\uB9AC\uB2E8 \uC140\uD504\uC0AC\uC9C4\uAD00"
  },
  {
    id: "hd-a3",
    districtId: "haeridan",
    name: "\uD574\uC6B4\uB300 \uBE14\uB8E8\uB77C\uC778\uD30C\uD06C \uBBF8\uD3EC \uB370\uD06C \uC0B0\uCC45\uB85C",
    category: "admission",
    price: 0,
    isFree: true,
    estimatedTimeMinutes: 45,
    summary: "\uD574\uBCC0\uC5F4\uCC28\uB97C \uD0C0\uC9C0 \uC54A\uC544\uB3C4 \uB098\uB780\uD788 \uC774\uC5B4\uC9C4 \uBC14\uB2E4 \uC808\uBCBD \uBAA9\uC7AC \uB370\uD06C\uB85C\uB4DC\uB97C \uBB34\uB8CC \uC0B0\uCC45",
    signature: "\uB3D9\uD574\uB0A8\uBD80\uC120 \uBC14\uB2E4\uBDF0 \uB370\uD06C\uB85C\uB4DC \uAC77\uAE30 (\uBB34\uB8CC \uD790\uB9C1)",
    tags: ["\uBC14\uB2E4\uB370\uD06C\uAE38", "\uD574\uBCC0\uC5F4\uCC28\uAD6C\uACBD", "\uBB34\uB8CC\uC785\uC7A5"],
    address: "\uBD80\uC0B0 \uD574\uC6B4\uB300\uAD6C \uB2EC\uB9DE\uC774\uAE3862\uBC88\uAE38 13",
    naverSearchUrl: "https://map.naver.com/p/search/\uBE14\uB8E8\uB77C\uC778\uD30C\uD06C \uBBF8\uD3EC",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uBE14\uB8E8\uB77C\uC778\uD30C\uD06C \uBBF8\uD3EC"
  },
  // 간식
  {
    id: "hd-s1",
    districtId: "haeridan",
    name: "\uD574\uB9AC\uB2E8 \uB974\uBC45\uCFE0\uD0A4 & \uC218\uC81C \uC0CC\uB4DC",
    category: "snack",
    price: 3800,
    estimatedTimeMinutes: 15,
    summary: "\uBC1C\uB85C\uB098 \uCD08\uCF5C\uB9BF\uACFC \uAD6C\uC6B4 \uD53C\uCE78\uC774 \uB4EC\uBFCD \uB4E4\uC5B4\uAC04 \uBB35\uC9C1\uD558\uACE0 \uCAC0\uB4DD\uD55C \uC544\uBA54\uB9AC\uCE78 \uCFE0\uD0A4",
    signature: "\uB354\uBE14 \uB2E4\uD06C \uD53C\uCE78 \uB974\uBC45\uCFE0\uD0A4 (3,800\uC6D0)",
    tags: ["\uC218\uC81C\uCFE0\uD0A4", "\uB2F9\uCDA9\uC804", "\uACE8\uBAA9\uAC04\uC2DD"],
    address: "\uBD80\uC0B0 \uD574\uC6B4\uB300\uAD6C \uC6B0\uB3D91\uB85C 34",
    naverSearchUrl: "https://map.naver.com/p/search/\uD574\uB9AC\uB2E8 \uCFE0\uD0A4",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uD574\uB9AC\uB2E8 \uCFE0\uD0A4"
  },
  // ==================== 4. 남포 보수동 책방골목 & 부평 깡통골목 (bosu) ====================
  // 식비
  {
    id: "bs-f1",
    districtId: "bosu",
    name: "\uBD80\uD3C9 \uAE61\uD1B5\uC2DC\uC7A5 \uC6D0\uC870 \uBE44\uBE54\uB2F9\uBA74 & \uC720\uBD80\uC804\uACE8",
    category: "food",
    price: 7500,
    estimatedTimeMinutes: 40,
    summary: "\uB9E4\uCF64\uB2EC\uCF64 \uBE44\uBC95 \uC591\uB150\uC7A5\uACFC \uC5B4\uBB35, \uC2DC\uAE08\uCE58\uB97C \uBC84\uBB34\uB9B0 \uBE44\uBE54\uB2F9\uBA74\uACFC \uD1B5\uD1B5\uD55C \uC218\uC81C \uC720\uBD80\uC8FC\uBA38\uB2C8",
    signature: "\uC6D0\uC870 \uBE44\uBE54\uB2F9\uBA74 & \uC720\uBD80\uC804\uACE8 1\uADF8\uB987 (7,500\uC6D0)",
    tags: ["\uC6D0\uC870\uB178\uD3EC", "\uBE44\uBE54\uB2F9\uBA74", "\uC720\uBD80\uC804\uACE8"],
    address: "\uBD80\uC0B0 \uC911\uAD6C \uC911\uAD6C\uB85C 43\uBC88\uAE38 30",
    naverSearchUrl: "https://map.naver.com/p/search/\uBD80\uD3C9\uC2DC\uC7A5 \uBE44\uBE54\uB2F9\uBA74",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uBD80\uD3C9\uC2DC\uC7A5 \uBE44\uBE54\uB2F9\uBA74"
  },
  {
    id: "bs-f2",
    districtId: "bosu",
    name: "\uBCF4\uC218\uB3D9 \uD560\uB9E4 \uAC00\uB9C8\uC1A5 \uBCF4\uB9AC\uBC25",
    category: "food",
    price: 6500,
    estimatedTimeMinutes: 40,
    summary: "\uAD6C\uC218\uD55C \uAC00\uB9C8\uC1A5 \uBCF4\uB9AC\uBC25\uC5D0 7\uAC00\uC9C0 \uB098\uBB3C\uACFC \uAC15\uB41C\uC7A5\uC744 \uC4F1\uC4F1 \uBE44\uBCBC\uBA39\uB294 40\uB144 \uC804\uD1B5 \uBC31\uBC18",
    signature: "\uAC00\uB9C8\uC1A5 \uBCF4\uB9AC\uBC25 \uB098\uBB3C \uC815\uC2DD (6,500\uC6D0)",
    tags: ["\uCC29\uD55C\uAC00\uACA9\uC5C5\uC18C", "\uAC00\uB9C8\uC1A5\uBCF4\uB9AC\uBC25", "\uC18D\uD3B8\uD55C\uD55C\uB07C"],
    address: "\uBD80\uC0B0 \uC911\uAD6C \uCC45\uBC29\uACE8\uBAA9\uAE38 8",
    naverSearchUrl: "https://map.naver.com/p/search/\uBCF4\uC218\uB3D9 \uBCF4\uB9AC\uBC25",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uBCF4\uC218\uB3D9 \uBCF4\uB9AC\uBC25"
  },
  {
    id: "bs-f3",
    districtId: "bosu",
    name: "\uB0A8\uD3EC\uB3D9 \uC591\uACF1\uCC3D \uACE8\uBAA9 \uC810\uC2EC \uBC31\uBC18",
    category: "food",
    price: 9e3,
    estimatedTimeMinutes: 45,
    summary: "\uC790\uAC08\uCE58 \uC2DC\uC7A5\uACFC \uC778\uC811\uD55C \uC591\uACF1\uCC3D \uACE8\uBAA9\uC758 \uC810\uC2EC \uD2B9\uC120 \uB41C\uC7A5\uCC0C\uAC1C\uC640 \uC0DD\uC120\uAD6C\uC774 \uBC31\uBC18",
    signature: "\uACE0\uB4F1\uC5B4\uAD6C\uC774 & \uD574\uBB3C\uB41C\uC7A5\uCC0C\uAC1C \uBC31\uBC18 (9,000\uC6D0)",
    tags: ["\uC0DD\uC120\uAD6C\uC774\uBC31\uBC18", "\uC790\uAC08\uCE58\uC2DC\uC7A5\uC815\uCDE8", "\uD478\uC9D0\uD55C\uBC18\uCC2C"],
    address: "\uBD80\uC0B0 \uC911\uAD6C \uC790\uAC08\uCE58\uB85C 23\uBC88\uAE38 6",
    naverSearchUrl: "https://map.naver.com/p/search/\uB0A8\uD3EC\uB3D9 \uC0DD\uC120\uAD6C\uC774 \uBC31\uBC18",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uB0A8\uD3EC\uB3D9 \uC0DD\uC120\uAD6C\uC774 \uBC31\uBC18"
  },
  // 카페
  {
    id: "bs-c1",
    districtId: "bosu",
    name: "\uBCF4\uC218\uB3D9 \uC815\uD1B5 \uC61B\uB0A0\uB2E4\uBC29 (\uC30D\uD654\uCC28)",
    category: "cafe",
    price: 5e3,
    estimatedTimeMinutes: 50,
    summary: "\uB178\uB978\uC790\uAC00 \uB3D9\uB3D9 \uB744\uC6CC\uC9C4 \uC218\uC81C \uD55C\uBC29 \uC30D\uD654\uCC28\uC640 \uD074\uB798\uC2DD LP\uAC00 \uD758\uB7EC\uB098\uC624\uB294 70\uB144\uB300 \uD0C0\uC784\uBA38\uC2E0",
    signature: "\uB2EC\uAC40\uB178\uB978\uC790 \uD55C\uBC29 \uC30D\uD654\uCC28 or \uD578\uB4DC\uB4DC\uB9BD (5,000\uC6D0)",
    tags: ["\uB808\uD2B8\uB85C\uB2E4\uBC29", "\uC30D\uD654\uCC28", "\uC544\uB0A0\uB85C\uADF8\uAC10\uC131"],
    address: "\uBD80\uC0B0 \uC911\uAD6C \uCC45\uBC29\uACE8\uBAA9\uAE38 14",
    naverSearchUrl: "https://map.naver.com/p/search/\uBCF4\uC218\uB3D9 \uB2E4\uBC29",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uBCF4\uC218\uB3D9 \uB2E4\uBC29"
  },
  {
    id: "bs-c2",
    districtId: "bosu",
    name: "\uCC45\uBC29\uACE8\uBAA9 \uBD81\uCE74\uD398 \uC6B0\uB9AC\uAE00\uBC29",
    category: "cafe",
    price: 5500,
    estimatedTimeMinutes: 50,
    summary: "\uC218\uB9CC \uAD8C\uC758 \uD5CC\uCC45\uC5D0 \uB458\uB7EC\uC2F8\uC778 \uACC4\uB2E8\uD615 \uC11C\uAC00 \uC9C0\uD558\uC5D0\uC11C \uC990\uAE30\uB294 \uC9C4\uD55C \uB4DC\uB9BD\uCEE4\uD53C \uD55C \uC794",
    signature: "\uCC45\uBC29 \uBE14\uB80C\uB4DC \uB4DC\uB9BD\uCEE4\uD53C (5,500\uC6D0)",
    tags: ["\uBD81\uCE74\uD398", "\uD5CC\uCC45\uBC29\uC11C\uAC00", "\uC870\uC6A9\uD55C\uB3C5\uC11C"],
    address: "\uBD80\uC0B0 \uC911\uAD6C \uB300\uCCAD\uB85C 63-1 \uC9C0\uD5581\uCE35",
    naverSearchUrl: "https://map.naver.com/p/search/\uC6B0\uB9AC\uAE00\uBC29 \uBD81\uCE74\uD398",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC6B0\uB9AC\uAE00\uBC29 \uBD81\uCE74\uD398"
  },
  {
    id: "bs-c3",
    districtId: "bosu",
    name: "\uAE61\uD1B5\uC2DC\uC7A5 \uC804\uD1B5 \uB2E8\uD325\uC8FD & \uC2DD\uD61C",
    category: "cafe",
    price: 4500,
    estimatedTimeMinutes: 30,
    summary: "\uAC00\uB9C8\uC1A5\uC5D0\uC11C \uBB49\uADFC\uD558\uAC8C \uB053\uC5EC\uB0B8 \uCC39\uC300\uB5A1 \uB2E8\uD325\uC8FD\uACFC \uC0B4\uC5BC\uC74C \uB3D9\uB3D9 \uB72C \uC61B\uB0A0 \uC2DD\uD61C",
    signature: "\uAC00\uB9C8\uC1A5 \uCC39\uC300 \uB2E8\uD325\uC8FD (4,500\uC6D0)",
    tags: ["\uC804\uD1B5\uB2E8\uD325\uC8FD", "\uC2DC\uC7A5\uC8FC\uC804\uBD80\uB9AC", "\uB2EC\uCF64\uD55C\uAD6D\uC0B0\uD325"],
    address: "\uBD80\uC0B0 \uC911\uAD6C \uBD80\uD3C91\uAE38 48",
    naverSearchUrl: "https://map.naver.com/p/search/\uBD80\uD3C9 \uAE61\uD1B5\uC2DC\uC7A5 \uB2E8\uD325\uC8FD",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uBD80\uD3C9 \uAE61\uD1B5\uC2DC\uC7A5 \uB2E8\uD325\uC8FD"
  },
  // 입장/체험
  {
    id: "bs-a1",
    districtId: "bosu",
    name: "\uBCF4\uC218\uB3D9 \uCC45\uBC29\uACE8\uBAA9 \uCD94\uC5B5\uC758 \uACE0\uC11C\xB7\uC2DC\uC9D1 \uBCF4\uBB3C\uCC3E\uAE30",
    category: "admission",
    price: 6e3,
    estimatedTimeMinutes: 45,
    summary: "70\uC5EC \uB144\uC758 \uC138\uC6D4\uC774 \uAE43\uB4E0 \uD5CC\uCC45\uBC29 \uACE8\uBAA9\uC5D0\uC11C \uB0B4 \uB9C8\uC74C\uC5D0 \uB2FF\uB294 \uBE48\uD2F0\uC9C0 \uC2DC\uC9D1/\uC218\uD544\uC9D1 1\uAD8C \uAD6C\uB9E4",
    signature: "\uBE48\uD2F0\uC9C0 \uBB38\uACE0\uD310 \uC2DC\uC9D1 1\uAD8C \uAD6C\uB9E4 \uC18C\uC7A5 (6,000\uC6D0)",
    tags: ["\uD5CC\uCC45\uBC29\uAC70\uB9AC", "\uC2DC\uC9D1\uC18C\uC7A5", "\uC544\uB0A0\uB85C\uADF8\uCD94\uC5B5"],
    address: "\uBD80\uC0B0 \uC911\uAD6C \uBCF4\uC218\uB3D91\uAC00 119 \uC77C\uB300",
    naverSearchUrl: "https://map.naver.com/p/search/\uBCF4\uC218\uB3D9 \uCC45\uBC29\uACE8\uBAA9",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uBCF4\uC218\uB3D9 \uCC45\uBC29\uACE8\uBAA9"
  },
  {
    id: "bs-a2",
    districtId: "bosu",
    name: "\uBD80\uC0B0 \uADFC\uD604\uB300\uC5ED\uC0AC\uAD00 & \uBCC4\uAD00 \uBCF5\uD569\uBB38\uD654\uACF5\uAC04",
    category: "admission",
    price: 0,
    isFree: true,
    estimatedTimeMinutes: 50,
    summary: "\uC61B \uB3D9\uC591\uCC99\uC2DD\uC8FC\uC2DD\uD68C\uC0AC\uC640 \uBBF8\uBB38\uD654\uC6D0 \uAC74\uBB3C\uC744 \uB9AC\uBAA8\uB378\uB9C1\uD55C \uAC10\uAC01\uC801\uC778 \uC778\uBB38\uD559 \uBD81\uC2A4\uD398\uC774\uC2A4",
    signature: "\uADFC\uB300 \uAC74\uCD95\uBB3C \uC804\uC2DC & \uC778\uBB38 \uBD81\uB77C\uC6B4\uC9C0 (\uBB34\uB8CC \uAD00\uB78C)",
    tags: ["\uBB34\uB8CC\uC804\uC2DC", "\uADFC\uB300\uAC74\uCD95", "\uC778\uBB38\uD559\uB77C\uC6B4\uC9C0"],
    address: "\uBD80\uC0B0 \uC911\uAD6C \uB300\uCCAD\uB85C 112",
    naverSearchUrl: "https://map.naver.com/p/search/\uBD80\uC0B0\uADFC\uD604\uB300\uC5ED\uC0AC\uAD00",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uBD80\uC0B0\uADFC\uD604\uB300\uC5ED\uC0AC\uAD00"
  },
  {
    id: "bs-a3",
    districtId: "bosu",
    name: "\uC6A9\uB450\uC0B0\uACF5\uC6D0 \uBD80\uC0B0\uD0C0\uC6CC \uB458\uB808\uAE38 \uC0B0\uCC45",
    category: "admission",
    price: 0,
    isFree: true,
    estimatedTimeMinutes: 40,
    summary: "\uC5D0\uC2A4\uCEEC\uB808\uC774\uD130\uB97C \uD0C0\uACE0 \uC62C\uB77C\uAC00 \uBD80\uC0B0 \uC6D0\uB3C4\uC2EC\uACFC \uC601\uB3C4 \uBC14\uB2E4\uB97C \uD55C\uB208\uC5D0 \uB0B4\uB824\uB2E4\uBCF4\uB294 \uC804\uB9DD \uC0B0\uCC45",
    signature: "\uC6A9\uB450\uC0B0 \uD314\uAC01\uC815 & \uC6D0\uB3C4\uC2EC \uC804\uB9DD\uB300 (\uBB34\uB8CC \uAD00\uB78C)",
    tags: ["\uC6D0\uB3C4\uC2EC\uC804\uB9DD", "\uACF5\uC6D0\uC0B0\uCC45", "\uBB34\uB8CC\uC785\uC7A5"],
    address: "\uBD80\uC0B0 \uC911\uAD6C \uC6A9\uB450\uC0B0\uAE38 37-55",
    naverSearchUrl: "https://map.naver.com/p/search/\uC6A9\uB450\uC0B0\uACF5\uC6D0",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC6A9\uB450\uC0B0\uACF5\uC6D0"
  },
  // 간식
  {
    id: "bs-s1",
    districtId: "bosu",
    name: "\uC774\uAC00\uB124 \uB5A1\uBCF6\uC774 \uACE8\uBAA9 \uBB34\uCC44 \uB5A1\uBCF6\uC774",
    category: "snack",
    price: 5e3,
    estimatedTimeMinutes: 20,
    summary: "\uBB3C \uC5C6\uC774 \uBB34\uC999\uC73C\uB85C\uB9CC \uB053\uC5EC\uB0B4 \uAC10\uCE60\uB9DB\uC774 \uD3ED\uBC1C\uD558\uB294 3\uB300\uCC9C\uC655 \uC6B0\uC2B9 \uB5A1\uD280 \uC138\uD2B8",
    signature: "\uBB34\uCC44 \uC300\uB5A1\uBCF6\uC774 & \uC218\uC81C\uD280\uAE40 \uC138\uD2B8 (5,000\uC6D0)",
    tags: ["3\uB300\uCC9C\uC655\uC6B0\uC2B9", "\uBB34\uCC44\uB5A1\uBCF6\uC774", "\uBD80\uD3C9\uC2DC\uC7A5\uBA85\uBB3C"],
    address: "\uBD80\uC0B0 \uC911\uAD6C \uBD80\uD3C91\uAE38 40",
    naverSearchUrl: "https://map.naver.com/p/search/\uC774\uAC00\uB124 \uB5A1\uBCF6\uC774",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC774\uAC00\uB124 \uB5A1\uBCF6\uC774"
  },
  // ==================== 5. 수영 망미단길 & F1963 (mangmi) ====================
  // 식비
  {
    id: "mm-f1",
    districtId: "mangmi",
    name: "\uB9DD\uBBF8 \uACE8\uBAA9 \uC218\uC81C\uBC84\uAC70 \uCF54\uB108",
    category: "food",
    price: 11e3,
    estimatedTimeMinutes: 50,
    summary: "\uB9E4\uC77C \uC544\uCE68 \uC9C1\uC811 \uCE58\uB300\uB294 \uC18C\uACE0\uAE30 \uD328\uD2F0\uC640 \uBE0C\uB9AC\uC624\uC288 \uBC88\uC758 \uC721\uC999 \uAC00\uB4DD\uD55C \uACE8\uBAA9 \uC218\uC81C\uBC84\uAC70",
    signature: "\uB9DD\uBBF8 \uD074\uB798\uC2DD \uCE58\uC988\uBC84\uAC70 & \uAC10\uC790\uD280\uAE40 (11,000\uC6D0)",
    tags: ["\uC218\uC81C\uBC84\uAC70", "\uC721\uC999\uAC00\uB4DD\uD328\uD2F0", "\uC80A\uC740\uACE8\uBAA9\uAC10\uC131"],
    address: "\uBD80\uC0B0 \uC218\uC601\uAD6C \uB9DD\uBBF8\uBC30\uC0B0\uB85C 10\uBC88\uAE38 18",
    naverSearchUrl: "https://map.naver.com/p/search/\uB9DD\uBBF8\uB2E8\uAE38 \uC218\uC81C\uBC84\uAC70",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uB9DD\uBBF8\uB2E8\uAE38 \uC218\uC81C\uBC84\uAC70"
  },
  {
    id: "mm-f2",
    districtId: "mangmi",
    name: "\uB9DD\uBBF8 \uACE8\uBAA9 \uAC00\uC815\uC2DD \uBC31\uBC18 (\uC18C\uC18C\uD55C\uC2DD)",
    category: "food",
    price: 8500,
    estimatedTimeMinutes: 40,
    summary: "\uC81C\uCCA0 \uB098\uBB3C\uACFC \uC5B4\uBA38\uB2C8 \uC190\uB9DB\uC758 \uC6B0\uB801\uAC15\uB41C\uC7A5, \uC81C\uC721\uBCF6\uC74C\uC774 \uC815\uAC08\uD558\uAC8C \uCC28\uB824\uC9C0\uB294 \uACE8\uBAA9 \uBC25\uC0C1",
    signature: "\uC6B0\uB801\uB41C\uC7A5 \uC81C\uC721 \uAC00\uC815\uC2DD \uC815\uC2DD (8,500\uC6D0)",
    tags: ["\uC815\uAC08\uD55C\uAC00\uC815\uC2DD", "\uC81C\uC721\uBCF6\uC74C", "\uAC00\uC131\uBE44\uC9D1\uBC25"],
    address: "\uBD80\uC0B0 \uC218\uC601\uAD6C \uB9DD\uBBF8\uBC88\uC601\uB85C 52\uBC88\uAE38 7",
    naverSearchUrl: "https://map.naver.com/p/search/\uB9DD\uBBF8\uB2E8\uAE38 \uBC31\uBC18",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uB9DD\uBBF8\uB2E8\uAE38 \uBC31\uBC18"
  },
  {
    id: "mm-f3",
    districtId: "mangmi",
    name: "F1963 \uD504\uB77C\uD558993 \uCCB4\uCF54 \uD38D \uB2E4\uC774\uB2DD",
    category: "food",
    price: 15e3,
    estimatedTimeMinutes: 60,
    summary: "\uCCB4\uCF54 \uC591\uC870 \uAE30\uC220\uB85C \uB9CC\uB4E0 \uC218\uC81C \uC0DD\uB9E5\uC8FC\uC640 \uAD74\uB77C\uC26C, \uD559\uC13C\uC744 \uC990\uAE30\uB294 \uC640\uC774\uC5B4 \uACF5\uC7A5 \uD38D",
    signature: "\uBE44\uD504 \uAD74\uB77C\uC26C \uC2A4\uD29C & \uAC13 \uAD6C\uC6B4 \uBE75 (15,000\uC6D0)",
    tags: ["\uCCB4\uCF54\uC218\uC81C\uB9E5\uC8FC", "\uACF5\uC7A5\uD615\uB2E4\uC774\uB2DD", "\uC774\uC0C9\uC591\uC2DD"],
    address: "\uBD80\uC0B0 \uC218\uC601\uAD6C \uAD6C\uB77D\uB85C 123\uBC88\uAE38 20",
    naverSearchUrl: "https://map.naver.com/p/search/F1963 \uD504\uB77C\uD558993",
    kakaoSearchUrl: "https://map.kakao.com/?q=F1963 \uD504\uB77C\uD558993"
  },
  // 카페
  {
    id: "mm-c1",
    districtId: "mangmi",
    name: "\uD14C\uB77C\uB85C\uC0AC \uC218\uC601\uC810 (F1963 \uBCF5\uD569\uBB38\uD654\uACF5\uAC04)",
    category: "cafe",
    price: 6500,
    estimatedTimeMinutes: 60,
    summary: "\uC624\uB798\uB41C \uACF5\uC7A5\uC758 \uC640\uC774\uC5B4 \uAD8C\uC120\uAE30\uC640 \uCCA0\uD310\uC744 \uC608\uC220\uB85C \uC2B9\uD654\uC2DC\uD0A8 \uC6C5\uC7A5\uD55C \uC2A4\uD398\uC15C\uD2F0 \uCEE4\uD53C \uACF5\uAC04",
    signature: "\uACFC\uD14C\uB9D0\uB77C \uD5E4\uB808\uB77C \uB4DC\uB9BD & \uAE4C\uB20C\uB808 (6,500\uC6D0)",
    tags: ["\uC640\uC774\uC5B4\uACF5\uC7A5\uC7AC\uC0DD", "\uD14C\uB77C\uB85C\uC0AC", "\uC555\uB3C4\uC801\uADDC\uBAA8"],
    address: "\uBD80\uC0B0 \uC218\uC601\uAD6C \uAD6C\uB77D\uB85C 123\uBC88\uAE38 20",
    naverSearchUrl: "https://map.naver.com/p/search/\uD14C\uB77C\uB85C\uC0AC \uC218\uC601\uC810",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uD14C\uB77C\uB85C\uC0AC \uC218\uC601\uC810"
  },
  {
    id: "mm-c2",
    districtId: "mangmi",
    name: "\uB9DD\uBBF8 \uC548\uB77D\uB2E4\uB77D\uBC29 (\uC8FC\uD0DD\uAC1C\uC870 \uCE74\uD398)",
    category: "cafe",
    price: 6e3,
    estimatedTimeMinutes: 50,
    summary: "\uB2E4\uB77D\uBC29\uC5D0 \uC62C\uB77C\uC628 \uB4EF \uB530\uC2A4\uD55C \uC6D0\uBAA9 \uC778\uD14C\uB9AC\uC5B4\uC640 \uC218\uC81C \uC2A4\uCF58, \uC740\uC740\uD55C \uAF43\uCC28\uC758 \uC548\uC2DD\uCC98",
    signature: "\uC5BC\uADF8\uB808\uC774 \uC218\uC81C \uC2A4\uCF58 & \uAF43\uCC28 \uD2F0\uD31F (6,000\uC6D0)",
    tags: ["\uC8FC\uD0DD\uAC1C\uC870", "\uB2E4\uB77D\uBC29\uBB34\uB4DC", "\uC2A4\uCF58\uB9DB\uC9D1"],
    address: "\uBD80\uC0B0 \uC218\uC601\uAD6C \uB9DD\uBBF8\uBC30\uC0B0\uB85C 16",
    naverSearchUrl: "https://map.naver.com/p/search/\uC548\uB77D\uB2E4\uB77D\uBC29 \uB9DD\uBBF8",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC548\uB77D\uB2E4\uB77D\uBC29 \uB9DD\uBBF8"
  },
  {
    id: "mm-c3",
    districtId: "mangmi",
    name: "\uB9DD\uBBF8 \uB85C\uC2A4\uD305 \uD558\uC6B0\uC2A4 (\uC2A4\uBAB0 \uBC30\uCE58)",
    category: "cafe",
    price: 5e3,
    estimatedTimeMinutes: 40,
    summary: "\uC6D0\uB450 \uBCF8\uC5F0\uC758 \uB2E8\uB9DB\uACFC \uAE54\uB054\uD55C \uC0B0\uBBF8\uB97C \uB04C\uC5B4\uB0B4\uB294 \uB9DD\uBBF8\uB2E8\uAE38 \uB85C\uCEEC \uB2E8\uACE8\uB4E4\uC758 \uC0AC\uB791\uBC29",
    signature: "\uB9DD\uBBF8 \uBE14\uB80C\uB4DC \uC544\uBA54\uB9AC\uCE74\uB178 & \uD718\uB0AD\uC2DC\uC5D0 (5,000\uC6D0)",
    tags: ["\uB85C\uCEEC\uB2E8\uACE8\uCE74\uD398", "\uAC00\uC131\uBE44\uCEE4\uD53C", "\uC870\uC6A9\uD55C\uB300\uD654"],
    address: "\uBD80\uC0B0 \uC218\uC601\uAD6C \uB9DD\uBBF8\uBC88\uC601\uB85C 60\uBC88\uAE38 12",
    naverSearchUrl: "https://map.naver.com/p/search/\uB9DD\uBBF8\uB2E8\uAE38 \uB85C\uC2A4\uD305",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uB9DD\uBBF8\uB2E8\uAE38 \uB85C\uC2A4\uD305"
  },
  // 입장/체험
  {
    id: "mm-a1",
    districtId: "mangmi",
    name: "F1963 \uD604\uB300\uBAA8\uD130\uC2A4\uD29C\uB514\uC624 & \uAD6D\uC81C\uAC24\uB7EC\uB9AC",
    category: "admission",
    price: 0,
    isFree: true,
    estimatedTimeMinutes: 60,
    summary: "\uC138\uACC4\uC801\uC778 \uD604\uB300 \uBBF8\uC220 \uAC70\uC7A5\uB4E4\uC758 \uC791\uD488 \uC804\uC2DC\uC640 \uB514\uC790\uC778 \uC804\uC2DC\uB97C \uBAA8\uB450 \uBB34\uB8CC\uB85C \uAD00\uB78C",
    signature: "\uD604\uB300 \uB514\uC790\uC778 \uAC24\uB7EC\uB9AC & \uC911\uC815 \uB300\uB098\uBB34 \uC232\uAE38 (\uBB34\uB8CC \uAD00\uB78C)",
    tags: ["\uBB34\uB8CC\uBBF8\uC220\uAD00", "\uD604\uB300\uBAA8\uD130\uC2A4\uD29C\uB514\uC624", "\uAD6D\uC81C\uAC24\uB7EC\uB9AC"],
    address: "\uBD80\uC0B0 \uC218\uC601\uAD6C \uAD6C\uB77D\uB85C 123\uBC88\uAE38 20",
    naverSearchUrl: "https://map.naver.com/p/search/\uD604\uB300\uBAA8\uD130\uC2A4\uD29C\uB514\uC624 \uBD80\uC0B0",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uD604\uB300\uBAA8\uD130\uC2A4\uD29C\uB514\uC624 \uBD80\uC0B0"
  },
  {
    id: "mm-a2",
    districtId: "mangmi",
    name: "\uB9DD\uBBF8 \uACE8\uBAA9 \uB3C5\uB9BD\uCD9C\uD310 \uC11C\uC810 \uBD81\uD22C\uC5B4",
    category: "admission",
    price: 8e3,
    estimatedTimeMinutes: 40,
    summary: "\uC0C1\uC5C5 \uCD9C\uD310\uBB3C\uC5D0\uC11C\uB294 \uBCFC \uC218 \uC5C6\uB294 \uB3C5\uD2B9\uD55C \uC2DC\uC120\uC758 \uB85C\uCEEC \uCC3D\uC791 \uC5D0\uC138\uC774 \uBC0F \uC77C\uB7EC\uC2A4\uD2B8 \uC9D1",
    signature: "\uBD80\uC0B0 \uCCAD\uB144 \uC791\uAC00 \uB3C5\uB9BD \uC5D0\uC138\uC774 1\uAD8C \uAD6C\uB9E4 (8,000\uC6D0)",
    tags: ["\uB3C5\uB9BD\uCD9C\uD310\uBB3C", "\uB3D9\uB124\uCC45\uBC29", "\uCDE8\uD5A5\uBC1C\uACAC"],
    address: "\uBD80\uC0B0 \uC218\uC601\uAD6C \uB9DD\uBBF8\uBC88\uC601\uB85C 38\uBC88\uAE38 5",
    naverSearchUrl: "https://map.naver.com/p/search/\uB9DD\uBBF8\uB3D9 \uB3C5\uB9BD\uC11C\uC810",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uB9DD\uBBF8\uB3D9 \uB3C5\uB9BD\uC11C\uC810"
  },
  {
    id: "mm-a3",
    districtId: "mangmi",
    name: "\uC218\uC601\uC0AC\uC801\uACF5\uC6D0 \uACF0\uC194\uB098\uBB34 \uC232\uAE38 \uC0B0\uCC45",
    category: "admission",
    price: 0,
    isFree: true,
    estimatedTimeMinutes: 40,
    summary: "\uC870\uC120\uC2DC\uB300 \uC218\uAD70\uC808\uB3C4\uC0AC\uC601\uC774 \uC788\uB358 \uC720\uC11C \uAE4A\uC740 \uACF5\uC6D0\uC73C\uB85C 500\uB144 \uB41C \uD478\uC870\uB098\uBB34\uC640 \uC232 \uC0B0\uCC45",
    signature: "\uCC9C\uC5F0\uAE30\uB150\uBB3C \uACF0\uC194 \uC232\uAE38 \uB3C4\uBCF4 \uC0B0\uCC45 (\uBB34\uB8CC \uD790\uB9C1)",
    tags: ["\uCC9C\uC5F0\uAE30\uB150\uBB3C", "\uC5ED\uC0AC\uACF5\uC6D0", "\uC232\uAE38\uD790\uB9C1"],
    address: "\uBD80\uC0B0 \uC218\uC601\uAD6C \uC218\uC601\uC131\uB85C 43",
    naverSearchUrl: "https://map.naver.com/p/search/\uC218\uC601\uC0AC\uC801\uACF5\uC6D0",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uC218\uC601\uC0AC\uC801\uACF5\uC6D0"
  },
  // 간식
  {
    id: "mm-s1",
    districtId: "mangmi",
    name: "\uB9DD\uBBF8 \uACE8\uBAA9 \uC218\uC81C \uAD6C\uC6C0\uACFC\uC790 \uAE4C\uB20C\uB808",
    category: "snack",
    price: 3300,
    estimatedTimeMinutes: 15,
    summary: "\uB7FC\uACFC \uBC14\uB2D0\uB77C \uD5A5\uC774 \uC9C4\uD55C \uAC89\uBC14\uC18D\uCD09 \uCAC0\uB4DD\uD55C \uD504\uB791\uC2A4 \uC804\uD1B5 \uAE4C\uB20C\uB808",
    signature: "\uBC14\uB2D0\uB77C \uBE48 \uB7FC \uAE4C\uB20C\uB808 (3,300\uC6D0)",
    tags: ["\uAE4C\uB20C\uB808", "\uD504\uB791\uC2A4\uB514\uC800\uD2B8", "\uACE8\uBAA9\uC120\uBB3C"],
    address: "\uBD80\uC0B0 \uC218\uC601\uAD6C \uB9DD\uBBF8\uBC30\uC0B0\uB85C 8",
    naverSearchUrl: "https://map.naver.com/p/search/\uB9DD\uBBF8\uB3D9 \uAE4C\uB20C\uB808",
    kakaoSearchUrl: "https://map.kakao.com/?q=\uB9DD\uBBF8\uB3D9 \uAE4C\uB20C\uB808"
  }
];

// src/data/transitRates.ts
var TRANSIT_COST_MODELS = {
  transit_walk: {
    type: "transit_walk",
    label: "\uC54C\uB730 \uB69C\uBC85\uC774 (\uB300\uC911\uAD50\uD1B5 + \uB3C4\uBCF4)",
    icon: "Subway",
    cost: 3100,
    // 부산 지하철/버스 1회 환승 포함 2회 왕복 (1,550원 x 2)
    summary: "\uBD80\uC0B0 \uB3C4\uC2DC\uCCA0\uB3C4 & \uBC84\uC2A4 \uD658\uC2B9 (\uC655\uBCF5 \uC57D 3,100\uC6D0)",
    description: "\uBD80\uC0B0 \uB3C4\uC2DC\uCCA0\uB3C4\uC640 \uC2DC\uB0B4\uBC84\uC2A4\uB97C \uD0C0\uACE0 \uACE8\uBAA9 \uC785\uAD6C\uAE4C\uC9C0 \uC774\uB3D9\uD55C \uB4A4, \uACE8\uBAA9 \uC548\uC5D0\uC11C\uB294 \uC5EC\uC720\uB86D\uAC8C \uAC77\uB294 \uCF54\uC2A4\uC785\uB2C8\uB2E4."
  },
  comfort_taxi: {
    type: "comfort_taxi",
    label: "\uD3B8\uC548 \uBBF9\uC2A4 (\uB300\uC911\uAD50\uD1B5 + \uB2E8\uAC70\uB9AC \uD0DD\uC2DC)",
    icon: "Car",
    cost: 8500,
    // 대중교통 1회(1,550원) + 골목 진입 택시 기본/단거리 1회(약 6,950원)
    summary: "\uC9C0\uD558\uCCA0 \uC774\uB3D9 \uD6C4 \uC624\uB974\uB9C9/\uD574\uC548\uAC00 \uD0DD\uC2DC \uD0D1\uC2B9 (\uC57D 8,500\uC6D0)",
    description: "\uC624\uB974\uB9C9\uAE38(\uC601\uB3C4 \uC0B0\uBCF5\uB3C4\uB85C, \uAC10\uCC9C \uB4F1)\uC774\uB098 \uC5ED\uC5D0\uC11C \uAC70\uB9AC\uAC00 \uC788\uB294 \uACE8\uBAA9\uAE4C\uC9C0 \uD0DD\uC2DC\uB97C \uD65C\uC6A9\uD558\uC5EC \uCCB4\uB825\uC744 \uC544\uB08D\uB2C8\uB2E4."
  }
};

// src/services/budgetCalculator.ts
function generateTravelPlan(preference) {
  const district = selectDistrict(preference);
  const transitModel = TRANSIT_COST_MODELS[preference.transitType];
  const transitCost = transitModel.cost;
  const districtSpots = SPOTS_DATA.filter((s) => s.districtId === district.id);
  const foodSpots = districtSpots.filter((s) => s.category === "food");
  const cafeSpots = districtSpots.filter((s) => s.category === "cafe");
  const admissionSpots = districtSpots.filter((s) => s.category === "admission");
  const snackSpots = districtSpots.filter((s) => s.category === "snack");
  let bestCombo = null;
  for (const food of foodSpots) {
    for (const cafe of cafeSpots) {
      for (const admission of admissionSpots) {
        for (const snack of [void 0, ...snackSpots]) {
          const subTotal = food.price + cafe.price + admission.price + (snack ? snack.price : 0);
          const totalWithTransit = transitCost + subTotal;
          if (totalWithTransit <= preference.budget) {
            const fillRatio = totalWithTransit / preference.budget;
            let score = fillRatio * 100;
            if (preference.theme === "cafe_dessert" && cafe.price >= 6500) score += 10;
            if (preference.theme === "local_food" && food.tags.includes("\uB85C\uCEEC\uB178\uD3EC")) score += 10;
            if (preference.theme === "ocean_healing" && admission.tags.includes("\uD574\uC548\uC0B0\uCC45\uB85C")) score += 10;
            if (preference.theme === "retro_culture" && admission.tags.includes("\uD5CC\uCC45\uBC29\uAC70\uB9AC")) score += 10;
            if (!bestCombo || score > bestCombo.score) {
              bestCombo = {
                food,
                cafe,
                admission,
                snack,
                totalCost: totalWithTransit,
                score
              };
            }
          }
        }
      }
    }
  }
  if (!bestCombo) {
    const minFood = [...foodSpots].sort((a, b) => a.price - b.price)[0] || foodSpots[0];
    const minCafe = [...cafeSpots].sort((a, b) => a.price - b.price)[0] || cafeSpots[0];
    const minAdmission = [...admissionSpots].filter((s) => s.isFree)[0] || [...admissionSpots].sort((a, b) => a.price - b.price)[0] || admissionSpots[0];
    const fallbackTotal = transitCost + minFood.price + minCafe.price + minAdmission.price;
    bestCombo = {
      food: minFood,
      cafe: minCafe,
      admission: minAdmission,
      snack: void 0,
      totalCost: fallbackTotal,
      score: 0
    };
  }
  const items = [
    {
      order: 1,
      timeSlot: "11:00 - 11:45",
      spot: {
        id: `transit-${district.id}`,
        districtId: district.id,
        name: `${district.subwayStation} \uB3C4\uCC29 & \uACE8\uBAA9 \uC9C4\uC785`,
        category: "transit",
        price: transitCost,
        estimatedTimeMinutes: 45,
        summary: transitModel.description,
        signature: transitModel.summary,
        tags: ["\uB300\uC911\uAD50\uD1B5", "\uD658\uC2B9\uD560\uC778", "\uB3C4\uBCF4\uC774\uB3D9"],
        address: district.subwayStation,
        naverSearchUrl: `https://map.naver.com/p/search/${encodeURIComponent(district.name)}`,
        kakaoSearchUrl: `https://map.kakao.com/?q=${encodeURIComponent(district.name)}`,
        tip: "\uBD80\uC0B0 \uC9C0\uD558\uCCA0\uC5D0\uC11C \uC2DC\uB0B4\uBC84\uC2A4 \uD658\uC2B9 \uC2DC 30\uBD84 \uC774\uB0B4 \uBB34\uB8CC \uD658\uC2B9\uC774 \uC801\uC6A9\uB429\uB2C8\uB2E4."
      },
      cost: transitCost,
      category: "transit",
      alternativeSpots: [],
      walkingDistanceNote: "\uC9C0\uD558\uCCA0\uC5ED \uCD9C\uAD6C\uC5D0\uC11C \uB3C4\uBCF4 3~7\uBD84 \uC18C\uC694"
    },
    {
      order: 2,
      timeSlot: "11:45 - 12:45",
      spot: bestCombo.food,
      cost: bestCombo.food.price,
      category: "food",
      alternativeSpots: foodSpots.filter((s) => s.id !== bestCombo?.food.id),
      walkingDistanceNote: "\uACE8\uBAA9 \uCD08\uC785\uC5D0\uC11C \uB3C4\uBCF4 5\uBD84"
    },
    {
      order: 3,
      timeSlot: "12:50 - 13:50",
      spot: bestCombo.cafe,
      cost: bestCombo.cafe.price,
      category: "cafe",
      alternativeSpots: cafeSpots.filter((s) => s.id !== bestCombo?.cafe.id),
      walkingDistanceNote: "\uC2DD\uB2F9\uC5D0\uC11C \uB3C4\uBCF4 3~5\uBD84 (\uAC19\uC740 \uACE8\uBAA9 \uB0B4)"
    },
    {
      order: 4,
      timeSlot: "14:00 - 15:10",
      spot: bestCombo.admission,
      cost: bestCombo.admission.price,
      category: "admission",
      alternativeSpots: admissionSpots.filter((s) => s.id !== bestCombo?.admission.id),
      walkingDistanceNote: "\uCE74\uD398 \uC778\uADFC \uBB38\uD654 \uC0B0\uCC45\uB85C \uB3C4\uBCF4 5\uBD84"
    }
  ];
  if (bestCombo.snack) {
    items.push({
      order: 5,
      timeSlot: "15:15 - 15:45",
      spot: bestCombo.snack,
      cost: bestCombo.snack.price,
      category: "snack",
      alternativeSpots: snackSpots.filter((s) => s.id !== bestCombo?.snack?.id),
      walkingDistanceNote: "\uACE8\uBAA9 \uADC0\uAC00\uAE38 \uC989\uC11D \uC8FC\uC804\uBD80\uB9AC"
    });
  }
  const costBreakdown = calculateCostBreakdown(preference.budget, items);
  return {
    id: `plan-${Date.now()}-${district.id}`,
    title: `${district.name} ${preference.budget.toLocaleString()}\uC6D0 \uB9DE\uCDA4 \uACE8\uBAA9 \uD22C\uC5B4`,
    district,
    preference,
    costBreakdown,
    items,
    alleyLocalSecretTip: district.localTip,
    savingsInsight: `\uC608\uC0B0 ${preference.budget.toLocaleString()}\uC6D0 \uC911 \uCD1D ${costBreakdown.totalSpent.toLocaleString()}\uC6D0\uC744 \uC9C0\uCD9C\uD558\uC5EC, ${costBreakdown.remainingBudget.toLocaleString()}\uC6D0\uC758 \uACE8\uBAA9 \uBE44\uC0C1\uAE08\uC774 \uB0A8\uC558\uC2B5\uB2C8\uB2E4!`
  };
}
function swapSpotInPlan(plan, itemOrder, newSpotId) {
  const targetSpot = SPOTS_DATA.find((s) => s.id === newSpotId);
  if (!targetSpot) return plan;
  const newItems = plan.items.map((item) => {
    if (item.order !== itemOrder) return item;
    const districtSpots = SPOTS_DATA.filter(
      (s) => s.districtId === plan.district.id && s.category === targetSpot.category
    );
    return {
      ...item,
      spot: targetSpot,
      cost: targetSpot.price,
      alternativeSpots: districtSpots.filter((s) => s.id !== targetSpot.id)
    };
  });
  const newBreakdown = calculateCostBreakdown(plan.preference.budget, newItems);
  return {
    ...plan,
    items: newItems,
    costBreakdown: newBreakdown,
    savingsInsight: `\uC120\uD0DD \uC7A5\uC18C\uB97C \uBCC0\uACBD\uD558\uC5EC \uCD1D \uC9C0\uCD9C\uC774 ${newBreakdown.totalSpent.toLocaleString()}\uC6D0\uC73C\uB85C \uAC31\uC2E0\uB418\uC5C8\uC2B5\uB2C8\uB2E4. (\uC794\uC5EC: ${newBreakdown.remainingBudget.toLocaleString()}\uC6D0)`
  };
}
function calculateCostBreakdown(budget, items) {
  let transitCost = 0;
  let foodCost = 0;
  let admissionCost = 0;
  let snackBufferCost = 0;
  for (const item of items) {
    if (item.category === "transit") transitCost += item.cost;
    else if (item.category === "food" || item.category === "cafe") foodCost += item.cost;
    else if (item.category === "admission") admissionCost += item.cost;
    else if (item.category === "snack") snackBufferCost += item.cost;
  }
  const totalSpent = transitCost + foodCost + admissionCost + snackBufferCost;
  const remainingBudget = Math.max(0, budget - totalSpent);
  const safeBase = Math.max(budget, totalSpent);
  const transitPercent = Math.round(transitCost / safeBase * 100);
  const foodPercent = Math.round(foodCost / safeBase * 100);
  const admissionPercent = Math.round(admissionCost / safeBase * 100);
  const bufferPercent = Math.max(0, 100 - (transitPercent + foodPercent + admissionPercent));
  return {
    transitCost,
    foodCost,
    admissionCost,
    snackBufferCost,
    totalSpent,
    remainingBudget,
    transitPercent,
    foodPercent,
    admissionPercent,
    bufferPercent
  };
}
function selectDistrict(preference) {
  if (preference.districtId !== "all") {
    const found = ALLEY_DISTRICTS.find((d) => d.id === preference.districtId);
    if (found) return found;
  }
  const themeMatches = ALLEY_DISTRICTS.filter(
    (d) => preference.theme === "all" || d.theme === preference.theme
  );
  const candidates = themeMatches.length > 0 ? themeMatches : ALLEY_DISTRICTS;
  const sorted = [...candidates].sort((a, b) => {
    const diffA = Math.abs(a.recommendedBudgetMin - preference.budget);
    const diffB = Math.abs(b.recommendedBudgetMin - preference.budget);
    return diffA - diffB;
  });
  return sorted[0] || ALLEY_DISTRICTS[0];
}

// src/services/planApi.ts
var PlanApiClient = class {
  static baseUrl = "";
  /**
   * 백엔드 서버에 여행 코스 저장 및 고유 공유 링크 발급
   */
  static async savePlan(plan, authorNickname = "\uBD80\uC0B0 \uB69C\uBC85\uC774") {
    try {
      const response = await fetch(`${this.baseUrl}/api/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, authorNickname })
      });
      if (!response.ok) {
        throw new Error(`\uC11C\uBC84 \uC751\uB2F5 \uC624\uB958 (${response.status})`);
      }
      return await response.json();
    } catch (error) {
      console.warn("\uBC31\uC5D4\uB4DC \uC800\uC7A5 \uC2E4\uD328, \uB85C\uCEEC Fallback \uC2AC\uB7EC\uADF8 \uC0DD\uC131:", error);
      const localSlug = `local-${Math.random().toString(36).substring(2, 7)}`;
      return {
        success: true,
        slug: localSlug,
        shareUrl: `${window.location.origin}/?plan=${localSlug}`,
        plan,
        message: "\uB85C\uCEEC \uC784\uC2DC \uB9C1\uD06C\uB85C \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4."
      };
    }
  }
  /**
   * 슬러그로 저장된 코스 상세 정보 조회
   */
  static async getPlanBySlug(slug) {
    try {
      const response = await fetch(`${this.baseUrl}/api/plans/${slug}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.success ? data.plan : null;
    } catch (error) {
      console.error("\uCF54\uC2A4 \uC870\uD68C \uC2E4\uD328:", error);
      return null;
    }
  }
  /**
   * 코스 좋아요(추천) 등록
   */
  static async likePlan(slug) {
    try {
      const response = await fetch(`${this.baseUrl}/api/plans/${slug}/like`, {
        method: "POST"
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.success ? data.likeCount : null;
    } catch (error) {
      console.error("\uC88B\uC544\uC694 \uC694\uCCAD \uC2E4\uD328:", error);
      return null;
    }
  }
  /**
   * 인기 큐레이션 코스 목록 조회
   */
  static async getPopularCurations(limit = 5) {
    try {
      const response = await fetch(`${this.baseUrl}/api/curations/popular?limit=${limit}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.success ? data.curations : [];
    } catch (error) {
      console.error("\uC778\uAE30 \uD050\uB808\uC774\uC158 \uC870\uD68C \uC2E4\uD328:", error);
      return [];
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ALLEY_DISTRICTS,
  PlanApiClient,
  SPOTS_DATA,
  generateTravelPlan,
  swapSpotInPlan
});
