import { weatherData } from '../data/spots';

const weatherIconMap: Record<string, string> = {
  CloudSun: 'fa-cloud-sun',
  CloudRain: 'fa-cloud-rain',
  Cloud: 'fa-cloud',
  Sun: 'fa-sun',
};

export default function WeatherSection() {
  return (
    <div className="intro-box bg-white rounded-[20px] p-4 md:p-5 shadow-lg border border-sky-100 mb-4">
      <h2 className="text-base md:text-lg font-extrabold text-sky-800 mb-3 flex items-center gap-2">
        <i className="fas fa-cloud-sun-rain text-primary" />
        2026端午台州天气预判与出行建议
      </h2>
      <p className="text-textLight text-sm md:text-base mb-4">
        端午假期（6月19日-6月21日）整体<strong>闷热潮湿、晴雨相间</strong>（梅雨初期）。多短时阵雨或局部雷雨，无持续性强暴雨，不影响自驾。山区海边风力偏大，雨后神仙居极易出云海！
      </p>
      <div className="weather-grid grid grid-cols-1 md:grid-cols-3 gap-3">
        {weatherData.map((day) => {
          const weatherIcon = weatherIconMap[day.icon] || 'fa-sun';
          return (
            <div
              key={day.day}
              className="weather-card bg-gradient-to-br from-white to-amber-50 rounded-xl p-3.5 border-[1.5px] border-amber-100 shadow-sm"
            >
              <div className="weather-title flex items-center justify-between mb-1.5 text-sm font-bold">
                <span>{day.day}</span>
                <span style={{ color: day.tempColor }}>
                  <i className={`fas ${weatherIcon}`} />
                  {day.temp}
                </span>
              </div>
              <p className="day-details bg-[#fefefe] p-[12px] rounded-sm border-l-[3px] border-l-amber-500 text-[0.85rem] leading-[1.6] text-[#475569]" dangerouslySetInnerHTML={{ __html: day.details }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
