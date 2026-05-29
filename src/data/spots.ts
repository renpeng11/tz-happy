import type { SpotData, WeatherDay, RouteData } from '../types';

export const spotsData: Record<string, SpotData> = {
  '国清寺': {
    icon: 'fa-gopuram',
    xhsUrl: 'http://xhslink.com/o/7OCVD1iNWBt',
    imageCount: 15,
    folder: '国清寺',
    description: '千年古刹，佛教天台宗祖庭',
  },
  '天台山大瀑布': {
    icon: 'fa-water',
    xhsUrl: 'http://xhslink.com/o/l9FtFZSYAJ',
    imageCount: 16,
    folder: '天台山大瀑布',
    description: '华东第一高瀑，落差325米',
  },
  '神仙居': {
    icon: 'fa-mountain-sun',
    xhsUrl: 'http://xhslink.com/o/7RXi0Njp8nd',
    imageCount: 18,
    folder: '神仙居・如意桥',
    description: '网红如意桥，南天顶玻璃观景台',
  },
  '紫阳古街': {
    icon: 'fa-house-chimney-window',
    xhsUrl: 'http://xhslink.com/o/9mjDEnzu8Yr',
    imageCount: 18,
    folder: '紫阳古街',
    description: '千年古街，非遗美食聚集地',
  },
  '台州府城墙': {
    icon: 'fa-landmark',
    xhsUrl: 'http://xhslink.com/o/5HYuPrhLjmh',
    imageCount: 18,
    folder: '台州府城墙（江南长城）',
    description: '江南长城，全国重点文保单位',
  },
  '七彩小箬村': {
    icon: 'fa-house-chimney-window',
    xhsUrl: 'http://xhslink.com/o/6fpux3CxzdF',
    imageCount: 12,
    folder: '七彩小箬村',
    description: '马卡龙彩色渔村，网红打卡地',
  },
  '长屿硐天': {
    icon: 'fa-archway',
    xhsUrl: 'http://xhslink.com/o/6HM3BZLq3k9',
    imageCount: 17,
    folder: '长屿硐天',
    description: '世界地质奇观，避暑胜地',
  },
  '对戒观景台': {
    icon: 'fa-ring',
    xhsUrl: 'http://xhslink.com/o/J8Qw0y9qj4',
    imageCount: 6,
    folder: '对戒观景台',
    description: '网红心形观景台，浪漫打卡点',
  },
  '千年曙光园': {
    icon: 'fa-sun',
    xhsUrl: 'http://xhslink.com/o/AwofHuA2FGM',
    imageCount: 14,
    folder: '千年曙光园',
    description: '中国大陆新千年第一缕曙光首照地',
  },
  '水桶岙': {
    icon: 'fa-umbrella-beach',
    xhsUrl: 'http://xhslink.com/o/Bzi0XL18qp',
    imageCount: 17,
    folder: '水桶岙',
    description: '小众原生态海滩，徒步路线',
  },
};

export const weatherData: WeatherDay[] = [
  {
    day: 'Day 1 (6.19)',
    icon: 'CloudSun',
    temp: '23℃-30℃',
    tempColor: '#64748b',
    details: '多云转阴，午后局部短时小雨。适合自驾赶路、古城闲逛、古刹游览。',
  },
  {
    day: 'Day 2 (6.20)',
    icon: 'CloudRain',
    temp: '22℃-29℃',
    tempColor: '#3b82f6',
    details: '阴有阵雨、局部雷雨。湿度高、风力大。<strong>上午优先登山看海</strong>，避开午后雷雨。',
  },
  {
    day: 'Day 3 (6.21)',
    icon: 'Cloud',
    temp: '21℃-27℃',
    tempColor: '#0d9488',
    details: '小雨转多云。体感凉爽，无强对流天气，路况良好，极佳的返程轻游玩日。',
  },
];

export const routesData: RouteData[] = [
  {
    id: 1,
    title: '路线 1：经典顺走版（最均衡，主推）',
    scheme: '方案一',
    description: '首次来台州，追求最标准合理解致的游玩爬山节奏。',
    drivingTime: '杭州→天台 2.2h | 天台→仙居 1.2h | 仙居→临海 1h',
    days: [
      {
        day: 1,
        title: '杭州 → 天台（佛韵山水） → 宿仙居',
        details: '国清寺祈福（1.5h） → 天台山大瀑布观瀑（2.5h） → 傍晚自驾赴仙居入住。',
        spots: ['国清寺', '天台山大瀑布'],
        itinerary: [
          { icon: 'fa-gopuram', text: '国清寺祈福' },
          { icon: 'fa-water', text: '天台山大瀑布观瀑' },
          { icon: 'fa-car', text: '傍晚自驾赴仙居入住。' },
        ],
      },
      {
        day: 2,
        title: '仙居（神仙居精品游） → 宿临海',
        details: '全天黄金上午游玩神仙居（3-4h，看如意桥、南天顶云海） → 傍晚抵临海 → 夜游紫阳古街吃糯叽叽小吃。',
        spots: ['神仙居', '紫阳古街'],
        itinerary: [
          { icon: 'fa-mountain-sun', text: '全天黄金上午游玩神仙居' },
          { icon: 'fa-water', text: '傍晚抵临海' },
          { icon: 'fa-person-shelter', text: '夜游紫阳古街吃糯叽叽小吃。' },
        ],
      },
      {
        day: 3,
        title: '临海古城全景 → 返回杭州',
        details: '上午登台州府城墙+逛东湖（2h） → 中午紫阳街深度逛吃收尾 → 下午平稳返程。',
        spots: ['台州府城墙'],
        itinerary: [
          { icon: 'fa-landmark', text: '上午登台州府城墙+逛东湖' },
          { icon: 'fa-person-shelter', text: '中午紫阳街深度逛吃收尾' },
          { icon: 'fa-arrow-right-to-city', text: '下午平稳返程。' },
        ],
      },
    ],
  },
  {
    id: 2,
    title: '路线 2：先轻松后爬山（懒人/团建首选）',
    scheme: '方案一',
    description: '怕累人群、公司团建。喜欢先闲逛吃喝，最后一天再冲高强度爬山。',
    drivingTime: '杭州→天台 2.2h | 天台→临海 1.1h',
    days: [
      {
        day: 1,
        title: '杭州 → 天台 → 宿临海',
        details: '游览天台国清寺、大瀑布 → 直接拉车到临海城区入住 → 晚上开启紫阳古街吃喝模式。',
        spots: ['国清寺', '天台山大瀑布', '紫阳古街'],
        itinerary: [
          { icon: 'fa-gopuram', text: '游览天台国清寺、大瀑布' },
          { icon: 'fa-water', text: '直接拉车到临海城区入住' },
          { icon: 'fa-person-shelter', text: '晚上开启紫阳古街吃喝模式。' },
        ],
      },
      {
        day: 2,
        title: '临海古城全天深度游 → 宿仙居',
        details: '上午登长城逛东湖园林 → 下午深入紫阳街体验非遗、慢节奏喝茶打卡 → 傍晚前往仙居住宿。',
        spots: ['台州府城墙', '紫阳古街'],
        itinerary: [
          { icon: 'fa-landmark', text: '上午登长城逛东湖园林' },
          { icon: 'fa-person-shelter', text: '下午深入紫阳街体验非遗、慢节奏喝茶打卡' },
          { icon: 'fa-bed', text: '傍晚前往仙居住宿。' },
        ],
      },
      {
        day: 3,
        title: '神仙居精华游 → 返回杭州',
        details: '上午索道上下轻松拿下神仙居核心美景（3-4h） → 中午仙居简餐 → 下午顺路平稳返程。',
        spots: ['神仙居'],
        itinerary: [
          { icon: 'fa-mountain-sun', text: '上午索道上下轻松拿下神仙居核心美景' },
          { icon: 'fa-utensils', text: '中午仙居简餐' },
          { icon: 'fa-arrow-right-to-city', text: '下午顺路平稳返程。' },
        ],
      },
    ],
  },
  {
    id: 3,
    title: '路线 3：美食优先版（重度小吃爱好者）',
    scheme: '方案一',
    description: '吃货天团！优先吃透紫阳古街的美食，山水体验后置。',
    drivingTime: '杭州→临海 2.5h | 临海→仙居 1h',
    days: [
      {
        day: 1,
        title: '杭州 → 临海古城 → 宿仙居',
        details: '直接长途奔袭至临海，全天吃透梅花糕、海苔饼与蛋清羊尾 → 爬城墙消食 → 傍晚去仙居住宿。',
        spots: ['紫阳古街', '台州府城墙'],
        itinerary: [
          { icon: 'fa-car', text: '直接长途奔袭至临海' },
          { icon: 'fa-utensils', text: '全天吃透梅花糕、海苔饼与蛋清羊尾' },
          { icon: 'fa-bed', text: '爬城墙消食，傍晚去仙居住宿。' },
        ],
      },
      {
        day: 2,
        title: '神仙居全天深度游 → 宿临海/天台',
        details: '深度领略神仙居火山流纹岩火山仙境 → 傍晚根据最后一天的需求就近休整入住。',
        spots: ['神仙居'],
        itinerary: [
          { icon: 'fa-mountain-sun', text: '深度领略神仙居火山流纹岩火山仙境' },
          { icon: 'fa-bed', text: '傍晚根据最后一天的需求就近休整入住。' },
        ],
      },
      {
        day: 3,
        title: '天台佛韵收尾 → 返回杭州',
        details: '上午打卡国清寺与天台山大瀑布 → 带着禅意与土特产轻松返回杭州。',
        spots: ['国清寺', '天台山大瀑布'],
        itinerary: [
          { icon: 'fa-gopuram', text: '上午打卡国清寺与天台山大瀑布' },
          { icon: 'fa-arrow-right-to-city', text: '带着禅意与土特产轻松返回杭州。' },
        ],
      },
    ],
  },
  {
    id: 4,
    title: '路线 4：山海均衡经典版（全能打卡，最适配6人行）',
    scheme: '方案二',
    description: '全覆盖。兼顾古城、高瀑、地质奇观、网红彩色渔村，全程不赶夜路。',
    drivingTime: '杭州→天台 2.2h | 临海→温岭石塘 1.6h | 温岭→杭州 2.8h',
    days: [
      {
        day: 1,
        title: '杭州 → 天台山水人文 → 夜游古城 → 宿临海',
        details: '国清寺（1.5h） + 天台山大瀑布（2.5h） → 傍晚奔赴临海，夜游紫阳古街吃糯叽叽美食。',
        spots: ['国清寺', '天台山大瀑布', '紫阳古街'],
        itinerary: [
          { icon: 'fa-gopuram', text: '国清寺祈福' },
          { icon: 'fa-water', text: '天台山大瀑布观瀑' },
          { icon: 'fa-person-shelter', text: '傍晚奔赴临海，夜游紫阳古街吃糯叽叽美食。' },
        ],
      },
      {
        day: 2,
        title: '临海古城半日游 → 傍晚温岭海景日落 → 宿温岭',
        details: '上午登临海城墙观东湖 → 下午15:00启程赴温岭石塘 → 傍晚刚好打卡绝美马卡龙【七彩小箬村】拍日落。',
        spots: ['台州府城墙', '七彩小箬村'],
        itinerary: [
          { icon: 'fa-landmark', text: '上午登临海城墙观东湖' },
          { icon: 'fa-car', text: '下午15:00启程赴温岭石塘' },
          { icon: 'fa-house-chimney-window', text: '傍晚打卡七彩小箬村拍日落。' },
        ],
      },
      {
        day: 3,
        title: '长屿硐天避暑避雨 → 网红海景精选 → 返程杭州',
        details: '上午游世界地质奇观长屿硐天（2-3h，超凉爽） → 中午品尝温岭海鲜大餐 → 下午轻踩对戒观景台与千年曙光园 → 返程。',
        spots: ['长屿硐天', '对戒观景台', '千年曙光园'],
        itinerary: [
          { icon: 'fa-archway', text: '上午游世界地质奇观长屿硐天' },
          { icon: 'fa-utensils', text: '中午品尝温岭海鲜大餐' },
          { icon: 'fa-arrow-right-to-city', text: '下午轻踩对戒观景台与千年曙光园，返程。' },
        ],
      },
    ],
  },
  {
    id: 5,
    title: '路线 5：古城美食主打 + 短途海景轻体验（零折返高效率）',
    scheme: '方案二',
    description: '贪吃、怕累。重度古城美食迷，搭配轻量海岛拍照，不折返。',
    drivingTime: '',
    days: [
      {
        day: 1,
        title: '杭州 → 临海全天古城深度游 → 傍晚奔赴海景 → 宿温岭',
        details: '上午登城墙俯瞰灵江，下午慢悠悠开盲盒式吃遍紫阳古街非遗老店 → 15:00出发温岭，宿温岭海景民宿。',
        spots: ['紫阳古街', '台州府城墙'],
        itinerary: [
          { icon: 'fa-landmark', text: '上午登城墙俯瞰灵江' },
          { icon: 'fa-utensils', text: '下午慢悠悠开盲盒式吃遍紫阳古街非遗老店' },
          { icon: 'fa-bed', text: '15:00出发温岭，宿温岭海景民宿。' },
        ],
      },
      {
        day: 2,
        title: '温岭海景网红轻游玩 → 折返仙居入住',
        details: '轻松打卡对戒观景台、金沙滩玩水踏沙 → 中午石塘海鲜大餐 → 午后提前自驾折返仙居就近入住休整，拒绝高强度赶路。',
        spots: ['对戒观景台', '水桶岙'],
        itinerary: [
          { icon: 'fa-ring', text: '轻松打卡对戒观景台、金沙滩玩水踏沙' },
          { icon: 'fa-utensils', text: '中午石塘海鲜大餐' },
          { icon: 'fa-bed', text: '午后提前自驾折返仙居就近入住休整。' },
        ],
      },
      {
        day: 3,
        title: '神仙居山水大片收尾 → 返回杭州',
        details: '抓住早晨黄金时间坐索道拿下神仙居如意桥、南天顶（3-4h） → 下午一路丝滑返回杭州。',
        spots: ['神仙居'],
        itinerary: [
          { icon: 'fa-mountain-sun', text: '抓住早晨黄金时间坐索道拿下神仙居如意桥、南天顶' },
          { icon: 'fa-arrow-right-to-city', text: '下午一路丝滑返回杭州。' },
        ],
      },
    ],
  },
  {
    id: 6,
    title: '路线 6：深度海景度假版（弱化山水，慵懒看海）',
    scheme: '方案二',
    description: '看海执念者。全程不爬大山，吹海风、吃大排档、躺平看日出日落。',
    drivingTime: '',
    days: [
      {
        day: 1,
        title: '杭州直达温岭 → 全天海边极致度假 → 宿温岭',
        details: '直奔温岭石塘 → 下午开启懒人度假：七彩小箬村＋金沙滩散步 → 晚上入住海景民宿，大排档海鲜吃过瘾。',
        spots: ['七彩小箬村', '水桶岙'],
        itinerary: [
          { icon: 'fa-car', text: '直奔温岭石塘' },
          { icon: 'fa-house-chimney-window', text: '下午开启懒人度假：七彩小箬村＋金沙滩散步' },
          { icon: 'fa-utensils', text: '晚上入住海景民宿，大排档海鲜吃过瘾。' },
        ],
      },
      {
        day: 2,
        title: '温岭海景打卡 + 硐天奇观 → 傍晚赴临海 → 宿临海',
        details: '起个大早看海上日出 → 上午逛对戒观景台和千年曙光园 → 下午在恒温的长屿硐天里避暑游览 → 傍晚前往临海，夜游古街。',
        spots: ['对戒观景台', '千年曙光园', '长屿硐天', '紫阳古街'],
        itinerary: [
          { icon: 'fa-sun', text: '起个大早看海上日出' },
          { icon: 'fa-ring', text: '上午逛对戒观景台和千年曙光园' },
          { icon: 'fa-person-shelter', text: '下午在恒温的长屿硐天里避暑游览，傍晚前往临海，夜游古街。' },
        ],
      },
      {
        day: 3,
        title: '临海古城轻逛 → 返回杭州',
        details: '睡到自然醒 → 上午慢节奏游览江南长城、东湖 → 随意挑选伴手礼与午餐 → 轻松自驾回杭。',
        spots: ['台州府城墙'],
        itinerary: [
          { icon: 'fa-sun', text: '睡到自然醒' },
          { icon: 'fa-landmark', text: '上午慢节奏游览江南长城、东湖' },
          { icon: 'fa-arrow-right-to-city', text: '随意挑选伴手礼与午餐，轻松自驾回杭。' },
        ],
      },
    ],
  },
  {
    id: 7,
    title: '路线 7：全海边纯度假版（全程无爬山，含小众秘境）',
    scheme: '方案二',
    description: '纯休闲、小众原生态山海步道控。含绝美水桶岙徒步路线。缺点是如果雨天体验较差。',
    drivingTime: '',
    days: [
      {
        day: 1,
        title: '杭州直达温岭 → 网红海景海风漫步 → 宿温岭',
        details: '全天石塘镇慢游：彩色渔村小箬村、金沙滩听海 → 夜幕下享受浪漫渔家烟火夜生活。',
        spots: ['七彩小箬村', '水桶岙'],
        itinerary: [
          { icon: 'fa-car', text: '杭州直达温岭' },
          { icon: 'fa-house-chimney-window', text: '全天石塘镇慢游：彩色渔村小箬村、金沙滩听海' },
          { icon: 'fa-moon', text: '夜幕下享受浪漫渔家烟火夜生活。' },
        ],
      },
      {
        day: 2,
        title: '全景温岭海景 + 长屿硐天避雨避暑 → 宿温岭',
        details: '早晨打卡悬崖对戒观景台、曙光园俯瞰东海 → 下午打卡长屿硐天 → 全程不挪窝，免去搬运行李疲劳。',
        spots: ['对戒观景台', '千年曙光园', '长屿硐天'],
        itinerary: [
          { icon: 'fa-ring', text: '早晨打卡悬崖对戒观景台、曙光园俯瞰东海' },
          { icon: 'fa-archway', text: '下午打卡长屿硐天' },
          { icon: 'fa-bed', text: '全程不挪窝，免去搬运行李疲劳。' },
        ],
      },
      {
        day: 3,
        title: '水桶岙小众山海轻徒步 → 轻松返程',
        details: '上午挑战入门级原生态户外路线：【水桶岙小环线（7km，3-4h）】，看澄澈湛蓝野生海景 → 中午海鲜面休整 → 下午元气满满打道回府。',
        spots: ['水桶岙'],
        itinerary: [
          { icon: 'fa-person-walking', text: '上午挑战入门级原生态户外路线：水桶岙小环线' },
          { icon: 'fa-utensils', text: '中午海鲜面休整' },
          { icon: 'fa-arrow-right-to-city', text: '下午元气满满打道回府。' },
        ],
      },
    ],
  },
];

export const routeLabels = [
  '路线1 (均衡)',
  '路线2 (先闲后爬)',
  '路线3 (美食优先)',
  '路线4 (经典山海)',
  '路线5 (无折返山海)',
  '路线6 (纯海度假)',
  '路线7 (野生海景)',
];
