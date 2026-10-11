import type { KitchenId } from "../types";

export const KITCHENS: {
  id: KitchenId;
  name: string;
  friend: string;
  job: string;
  line: string;
  empty: string;
}[] = [
  {
    id: "duffy",
    name: "达菲暖厨房",
    friend: "Duffy",
    job: "全国家常",
    line: "美志回来啦，小熊把灯打开了",
    empty: "达菲坐在餐桌边等美志点第一道",
  },
  {
    id: "gelatoni",
    name: "Gelatoni 新疆画廊",
    friend: "Gelatoni",
    job: "新疆美食",
    line: "薄荷画家把大盘鸡画进盘子里",
    empty: "Gelatoni 在调色盘上等美志点串",
  },
  {
    id: "stellalou",
    name: "StellaLou 酸辣舞台",
    friend: "StellaLou",
    job: "贵州美食",
    line: "跳跳兔说酸汤可以少辣，折耳根也能关",
    empty: "StellaLou 热身完毕，等美志点酸汤",
  },
  {
    id: "shelliemay",
    name: "ShellieMay 贝壳灶",
    friend: "ShellieMay",
    job: "江浙沪",
    line: "粉缎带熊把红烧肉炖得软软的",
    empty: "ShellieMay 在系围裙，等美志点江南菜",
  },
  {
    id: "cookieann",
    name: "CookieAnn 烘焙屋",
    friend: "CookieAnn",
    job: "面点甜点饮",
    line: "黄帽子小狗发明了今晚的主食",
    empty: "CookieAnn 闻了闻烤箱：还没有点心",
  },
  {
    id: "olumel",
    name: "OluMel 菠萝汤寮",
    friend: "'Olu Mel",
    job: "粤桂滇琼",
    line: "小龟弹琴，汤和米线慢慢滚",
    empty: "OluMel 拨了拨琴弦，等一碗米线",
  },
  {
    id: "linabell",
    name: "LinaBell 探店社",
    friend: "LinaBell",
    job: "东北华北西北",
    line: "小狐狸放大镜找到美志今日三道",
    empty: "LinaBell 还在搜查美志想吃什么",
  },
];

export function kitchenById(id: KitchenId) {
  return KITCHENS.find((k) => k.id === id)!;
}
