import RouteCard from './RouteCard';
import { routesData } from '../data/spots';

export default function RoutesSection() {
  const schemeOneRoutes = routesData.filter(r => r.scheme === '方案一');
  const schemeTwoRoutes = routesData.filter(r => r.scheme === '方案二');

  return (
    <div className="routes-section">
      <div className="route-section-title text-lg font-extrabold text-sky-800 mb-4 flex items-center gap-2 pb-2 border-b-2 border-sky-100 mt-7">
        <i className="fas fa-mountain text-primary" />
        方案一：无海纯人文山水路线（天台 + 仙居 + 临海）
      </div>
      <p className="text-textLight text-sm mb-5 mt-1">
        注：路线1/2/3打卡景点完全相同，仅游玩、爬山体力和住宿顺序不同，根据偏好自由挑选。
      </p>
      {schemeOneRoutes.map((route) => (
        <RouteCard key={route.id} route={route} />
      ))}

      <div className="route-section-title text-lg font-extrabold text-sky-800 mb-4 flex items-center gap-2 pb-2 border-b-2 border-sky-100 mt-7">
        <i className="fas fa-waves text-primary" />
        方案二：有海山海结合路线（海岛 + 溶洞 + 滨海风光）
      </div>
      {schemeTwoRoutes.map((route) => (
        <RouteCard key={route.id} route={route} />
      ))}
    </div>
  );
}
