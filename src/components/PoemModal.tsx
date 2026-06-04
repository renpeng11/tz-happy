import { useState } from 'react';

/**
 * 端午节不可用
 * 此弹窗显示的是李白的《梦游天姥吟留别》，与端午节无关
 * 端午节（农历五月初五）应禁用此功能
 */

interface PoemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PoemModal({ isOpen, onClose }: PoemModalProps) {
  if (!isOpen) return null;

  const pinyinData = [
    { word: '瀛洲', pinyin: 'yíng zhōu' },
    { word: '天姥', pinyin: 'tiān mǔ' },
    { word: '天台', pinyin: 'tān tāi' },
    { word: '剡溪', pinyin: 'shàn xī' },
    { word: '渌水', pinyin: 'lù shuǐ' },
    { word: '屐', pinyin: 'jī' },
    { word: '暝', pinyin: 'míng' },
    { word: '殷', pinyin: 'yǐn' },
    { word: '巅', pinyin: 'diān' },
    { word: '澹澹', pinyin: 'dàn dàn' },
    { word: '霹雳', pinyin: 'pī lì' },
    { word: '丘峦', pinyin: 'qiū luán' },
    { word: '扉', pinyin: 'fēi' },
    { word: '訇然', pinyin: 'hōng rán' },
    { word: '青冥', pinyin: 'qīng míng' },
    { word: '霓', pinyin: 'ní' },
    { word: '鸾', pinyin: 'luán' },
    { word: '悸', pinyin: 'jì' },
  ];

  const poemLines = [
    '海客谈瀛洲，烟涛微茫信难求；',
    '越人语天姥，云霞明灭或可睹。',
    '天姥连天向天横，势拔五岳掩赤城。',
    '天台四万八千丈，对此欲倒东南倾。',
    '我欲因之梦吴越，一夜飞度镜湖月。',
    '湖月照我影，送我至剡溪。',
    '谢公宿处今尚在，渌水荡漾清猿啼。',
    '脚著谢公屐，身登青云梯。',
    '半壁见海日，空中闻天鸡。',
    '千岩万转路不定，迷花倚石忽已暝。',
    '熊咆龙吟殷岩泉，栗深林兮惊层巅。',
    '云青青兮欲雨，水澹澹兮生烟。',
    '列缺霹雳，丘峦崩摧。',
    '洞天石扉，訇然中开。',
    '青冥浩荡不见底，日月照耀金银台。',
    '霓为衣兮风为马，云之君兮纷纷而来下。',
    '虎鼓瑟兮鸾回车，仙之人兮列如麻。',
    '忽魂悸以魄动，恍惊起而长嗟。',
    '惟觉时之枕席，失向来之烟霞。',
    '世间行乐亦如此，古来万事东流水。',
    '别君去兮何时还？且放白鹿青崖间。',
    '须行即骑访名山。',
    '安能摧眉折腰事权贵，使我不得开心颜！',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <i className="fas fa-book-open text-primary text-2xl" />
            <h3 className="text-xl font-bold text-text">梦游天姥吟留别</h3>
          </div>
          <button onClick={onClose} className="text-textLight hover:text-text transition-colors">
            <i className="fas fa-times text-xl" />
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-center gap-2 text-red-600 text-sm">
            <i className="fas fa-exclamation-triangle" />
            <span>端午节不可用</span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 max-h-[calc(85vh-80px)] overflow-y-auto scrollbar-hide">
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          <div className="text-center text-textLight text-sm mb-4">唐 · 李白</div>
          <div className="space-y-3 font-serif">
            {poemLines.map((line, index) => (
              <p key={index} className="text-lg text-text text-center leading-relaxed">
                {line}
              </p>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-amber-200">
            <div className="text-sm text-textLight mb-2 font-semibold">生字注音</div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-sm">
              {pinyinData.map((item, index) => (
                <span key={index} className="flex items-center gap-1.5">
                  <span className="text-text font-medium">{item.word}</span>
                  <span className="text-textLight">{item.pinyin}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
