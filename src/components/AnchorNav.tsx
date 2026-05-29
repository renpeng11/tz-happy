import { useState, type MouseEvent as ReactMouseEvent } from 'react';

interface NavItem {
  id: string;
  label: string;
}

export default function AnchorNav() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: 'route1', label: '路线1：经典顺走版' },
    { id: 'route2', label: '路线2：先轻松后爬山' },
    { id: 'route3', label: '路线3：美食优先版' },
    { id: 'route4', label: '路线4：山海均衡经典版' },
    { id: 'route5', label: '路线5：古城美食主打' },
    { id: 'route6', label: '路线6：深度海景度假版' },
    { id: 'route7', label: '路线7：全海边纯度假版' },
    { id: 'results', label: '投票统计看板' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsOpen(false);
  };

  const handleClickOutside = (e: ReactMouseEvent<HTMLDivElement>) => {
    const anchorNav = document.getElementById('anchorNav');
    if (anchorNav && !anchorNav.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="anchor-nav fixed left-3 top-1/2 -translate-y-1/2 z-[999]" id="anchorNav">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`anchor-nav-toggle w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary text-white border-none cursor-pointer flex items-center justify-center text-xl shadow-lg transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-gradient-to-r from-accent to-pink-400' : ''}`}
        >
          <i className="fas fa-list" />
        </button>
        <div className={`anchor-nav-menu absolute left-14 top-1/2 -translate-y-1/2 bg-white rounded-xl py-2 shadow-xl min-w-[180px] transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          {navItems.map((item) => (
            <span
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="anchor-link block px-4 py-3 text-text text-sm font-semibold hover:bg-gradient-to-r from-sky-50 to-purple-50 hover:text-primary hover:pl-5 border-l-[3px] border-transparent hover:border-primary cursor-pointer transition-all"
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
      {isOpen && (
        <div className="fixed inset-0 z-[998]" onClick={handleClickOutside} />
      )}
    </>
  );
}
