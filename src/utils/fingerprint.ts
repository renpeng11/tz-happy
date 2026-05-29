export function generateFingerprint(): string {
  let fingerprint = localStorage.getItem("browser_fingerprint");
  if (fingerprint) {
    return fingerprint;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    fingerprint = "fp_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("browser_fingerprint", fingerprint);
    return fingerprint;
  }
  
  ctx.textBaseline = "top";
  ctx.font = "14px 'Arial'";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#f60";
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = "#069";
  ctx.fillText("BrowserFingerprint", 2, 15);
  const canvasData = canvas.toDataURL();

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "unknown",
    canvasData,
    Array.from(navigator.plugins)
      .map((p) => p.name)
      .join(","),
  ];

  fingerprint =
    "fp_" +
    components
      .join("|||")
      .split("")
      .reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0)
      .toString(36) +
    Math.random().toString(36).substring(2, 8);

  localStorage.setItem("browser_fingerprint", fingerprint);
  return fingerprint;
}

export interface ItineraryStep {
  icon: string;
  text: string;
}

export function parseItinerarySteps(text: string): ItineraryStep[] {
  const steps: ItineraryStep[] = [];
  const parts = text.split(/→|→/g);

  parts.forEach((part) => {
    part = part.trim();
    if (!part) return;

    let icon = "MapPin";

    if (part.includes("寺") || part.includes("佛") || part.includes("祈福")) {
      icon = "Landmark";
    } else if (part.includes("瀑布") || part.includes("水") || part.includes("观瀑")) {
      icon = "Droplets";
    } else if (part.includes("山") || part.includes("登山") || part.includes("爬山") || part.includes("神仙居")) {
      icon = "Mountain";
    } else if (part.includes("古街") || part.includes("古城") || part.includes("街")) {
      icon = "Home";
    } else if (part.includes("长城") || part.includes("城墙")) {
      icon = "Castle";
    } else if (part.includes("村") || part.includes("七彩")) {
      icon = "Building2";
    } else if (part.includes("硐") || part.includes("洞")) {
      icon = "Mountain";
    } else if (part.includes("海") || part.includes("海景") || part.includes("沙滩") || part.includes("对戒") || part.includes("曙光")) {
      icon = "Waves";
    } else if (part.includes("自驾") || part.includes("赴") || part.includes("抵")) {
      icon = "Car";
    } else if (part.includes("宿") || part.includes("入住")) {
      icon = "Bed";
    } else if (part.includes("吃") || part.includes("糯叽叽") || part.includes("海鲜") || part.includes("小吃")) {
      icon = "UtensilsCrossed";
    } else if (part.includes("返程")) {
      icon = "ArrowRight";
    } else if (part.includes("徒步")) {
      icon = "PersonStanding";
    }

    const cleanText = part.replace(/（[^）]*）/g, "").trim();
    if (cleanText) {
      steps.push({ icon, text: cleanText });
    }
  });

  return steps;
}
