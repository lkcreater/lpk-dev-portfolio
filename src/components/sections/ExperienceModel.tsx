import type { CSSProperties, ReactNode } from "react";

type ExperienceModelProps = {
  id: string;
  label: string;
  type: string;
};

function FinanceModel() {
  return (
    <>
      <g className="svg-float">
        <path className="model-surface" d="M72 236 258 134l190 94-190 104Z" />
        <path
          className="model-grid"
          d="m108 236 151-82 154 75-154 84ZM139 220l153 76M177 199l153 76M216 178l153 76M109 255l187-101M145 273l187-101M182 291l187-101"
        />
        <path className="model-accent svg-draw" d="m119 247 52-42 47 20 55-54 57 24 58-43" />
        <g className="svg-bars">
          <path className="model-solid" d="m145 243 20-11v-35l-20 11Z" />
          <path className="model-solid" d="m198 215 20-11v-61l-20 11Z" />
          <path className="model-solid" d="m251 187 20-11v-84l-20 11Z" />
        </g>
      </g>
      <g className="svg-pulse model-coin">
        <circle className="model-surface" cx="376" cy="112" r="51" />
        <circle className="model-accent" cx="376" cy="112" r="33" />
        <path className="model-line" d="M360 102h31M360 113h23M360 124h28" />
      </g>
    </>
  );
}

function CorporateModel() {
  return (
    <>
      <g className="svg-float">
        <path className="model-surface" d="M91 102h302l37 43-38 162H91L54 265Z" />
        <path className="model-line" d="M91 102 54 145h339l37-43M54 145l37 42h301l38-42" />
        <circle className="model-solid" cx="82" cy="124" r="5" />
        <circle className="model-solid" cx="99" cy="124" r="5" />
        <circle className="model-solid" cx="116" cy="124" r="5" />
        <path className="model-accent svg-draw" d="M116 216h112M116 238h166M116 260h134" />
        <rect className="model-panel svg-pulse" x="306" y="203" width="78" height="66" rx="5" />
      </g>
      <g className="svg-nodes">
        <circle className="model-node" cx="119" cy="70" r="13" />
        <circle className="model-node" cx="259" cy="49" r="13" />
        <circle className="model-node" cx="404" cy="73" r="13" />
        <path className="model-line svg-draw" d="m132 68 114-17M272 51l119 20" />
      </g>
    </>
  );
}

function PublicModel() {
  return (
    <>
      <g className="svg-orbit">
        <ellipse className="model-line" cx="260" cy="176" rx="172" ry="72" />
        <ellipse className="model-line" cx="260" cy="176" rx="172" ry="72" transform="rotate(58 260 176)" />
        <ellipse className="model-line" cx="260" cy="176" rx="172" ry="72" transform="rotate(-58 260 176)" />
      </g>
      <circle className="model-surface svg-pulse" cx="260" cy="176" r="83" />
      <path
        className="model-grid"
        d="M179 176h162M192 137h136M193 215h134M260 93c-35 32-50 57-50 83s15 52 50 83M260 93c35 32 50 57 50 83s-15 52-50 83"
      />
      <g className="svg-nodes">
        <circle className="model-node" cx="128" cy="105" r="11" />
        <circle className="model-node" cx="398" cy="128" r="11" />
        <circle className="model-node" cx="371" cy="274" r="11" />
        <circle className="model-node" cx="122" cy="259" r="11" />
      </g>
      <path
        className="model-accent svg-draw"
        d="m137 110 60 35M387 134l-65 27M362 266l-62-38M133 252l73-36"
      />
    </>
  );
}

function PublishingModel() {
  return (
    <>
      <g className="svg-pages">
        <path className="model-surface page-back" d="m117 112 182-53 111 184-181 56Z" />
        <path className="model-surface page-mid" d="m95 132 183-53 111 184-182 55Z" />
        <path className="model-surface page-front" d="m73 154 183-54 112 184-183 55Z" />
        <path
          className="model-accent svg-draw"
          d="m115 181 113-33M127 203l155-45M139 225l122-35M151 247l151-44"
        />
        <rect
          className="model-panel svg-pulse"
          x="115"
          y="265"
          width="73"
          height="29"
          rx="3"
          transform="rotate(-16 115 265)"
        />
      </g>
      <path className="model-line svg-draw" d="M324 78c48 13 76 42 84 86" />
    </>
  );
}

function LearningModel() {
  return (
    <>
      <g className="svg-float">
        <path className="model-surface" d="M89 114h342v181H89Z" />
        <path
          className="model-grid"
          d="m89 295 80-76h181l81 76M169 219v76M350 219v76M89 114l80 105M431 114l-81 105"
        />
        <path className="model-line" d="M169 219h181V114H169Z" />
      </g>
      <g className="svg-nodes">
        <circle className="model-hotspot svg-pulse" cx="204" cy="176" r="16" />
        <circle className="model-hotspot svg-pulse delay-1" cx="314" cy="154" r="13" />
        <circle className="model-hotspot svg-pulse delay-2" cx="363" cy="245" r="11" />
      </g>
      <g className="model-waveform">
        <path
          className="model-accent svg-draw"
          d="M159 75v21M177 66v39M195 78v15M213 59v54M231 72v27M249 63v45M267 78v15M285 68v35M303 75v21M321 62v47M339 78v15M357 69v33"
        />
      </g>
      <path className="model-line" d="m198 176 8 8 15-19M308 154l6 6 12-15" />
    </>
  );
}

function CampaignModel() {
  return (
    <>
      <g className="svg-orbit">
        <ellipse className="model-line" cx="260" cy="179" rx="185" ry="91" />
        <ellipse className="model-line" cx="260" cy="179" rx="141" ry="131" transform="rotate(42 260 179)" />
      </g>
      <g className="svg-pulse">
        <circle className="model-surface" cx="260" cy="179" r="69" />
        <circle className="model-accent" cx="260" cy="179" r="43" />
        <path className="model-line" d="m242 179 13 13 27-31" />
      </g>
      <g className="svg-nodes">
        <circle className="model-node" cx="91" cy="141" r="18" />
        <circle className="model-node" cx="407" cy="105" r="18" />
        <circle className="model-node" cx="421" cy="256" r="18" />
        <circle className="model-node" cx="126" cy="286" r="18" />
      </g>
      <path
        className="model-accent svg-draw"
        d="m108 146 86 21M394 114l-73 35M405 250l-89-42M142 278l68-62"
      />
    </>
  );
}

function EngagementModel() {
  return (
    <>
      <path
        className="model-surface"
        d="M76 89h163v97H122l-34 29 8-29H76ZM282 143h163v97H327l-34 30 8-30h-19Z"
      />
      <path className="model-accent svg-draw" d="M105 119h99M105 140h72M311 174h101M311 195h68" />
      <g className="svg-flow">
        <path className="model-line" d="M84 299h352" />
        <circle className="model-hotspot" cx="112" cy="299" r="13" />
        <circle className="model-hotspot delay-1" cx="211" cy="299" r="13" />
        <circle className="model-hotspot delay-2" cx="310" cy="299" r="13" />
        <circle className="model-hotspot delay-3" cx="408" cy="299" r="13" />
      </g>
      <path className="model-accent svg-draw" d="m239 139 43 37M239 173l43 17" />
    </>
  );
}

function DeveloperModel() {
  return (
    <>
      <g className="svg-float">
        <path className="model-surface" d="M101 78h318v205H101Z" />
        <path className="model-surface" d="m101 283-43 28h404l-43-28Z" />
        <path className="model-panel" d="M218 78h84v18h-84Z" />
        <circle className="model-hotspot svg-pulse" cx="287" cy="87" r="5" />
        <path
          className="model-accent svg-draw"
          d="m145 141 29 25-29 25M190 191h59M282 140h91M282 166h70M282 192h84M282 218h52"
        />
      </g>
      <g className="svg-notifications">
        <rect className="model-panel note-1" x="326" y="38" width="132" height="52" rx="8" />
        <rect className="model-panel note-2" x="58" y="232" width="126" height="48" rx="8" />
      </g>
    </>
  );
}

function AiPlatformModel() {
  return (
    <>
      <g className="svg-orbit">
        <circle className="model-line" cx="260" cy="179" r="139" />
        <circle className="model-line" cx="260" cy="179" r="102" />
      </g>
      <path className="model-surface svg-pulse" d="m260 107 63 36v73l-63 36-63-36v-73Z" />
      <path
        className="model-accent svg-draw"
        d="M228 171c0-22 15-39 34-39 14 0 25 8 29 20 16 2 27 15 27 31 0 18-14 32-32 32h-55c-17 0-30-13-30-29 0-12 7-23 18-27 2-15 14-27 29-27M236 181h48M245 164l-9 17 9 17M276 164l9 17-9 17"
      />
      <g className="svg-nodes">
        <rect className="model-panel" x="66" y="86" width="92" height="50" rx="5" />
        <rect className="model-panel" x="361" y="80" width="92" height="50" rx="5" />
        <rect className="model-panel" x="374" y="241" width="92" height="50" rx="5" />
        <rect className="model-panel" x="55" y="247" width="92" height="50" rx="5" />
      </g>
      <path
        className="model-accent svg-draw"
        d="m158 112 65 39M361 107l-66 42M374 264l-71-47M147 270l75-51"
      />
    </>
  );
}

function modelFor(type: string): ReactNode {
  switch (type) {
    case "finance":
      return <FinanceModel />;
    case "corporate":
      return <CorporateModel />;
    case "public":
      return <PublicModel />;
    case "publishing":
      return <PublishingModel />;
    case "learning":
      return <LearningModel />;
    case "campaign":
      return <CampaignModel />;
    case "engagement":
      return <EngagementModel />;
    case "developer":
      return <DeveloperModel />;
    case "ai-platform":
      return <AiPlatformModel />;
    default:
      return <CorporateModel />;
  }
}

export function ExperienceModel({ id, label, type }: ExperienceModelProps) {
  const gradientId = `experience-gradient-${id}`;
  const glowId = `experience-glow-${id}`;

  return (
    <div className="experience-model">
      <svg
        className="experience-svg"
        viewBox="0 0 520 360"
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
      >
        <title id={`${id}-title`}>{label}</title>
        <desc id={`${id}-desc`}>Animated system model illustrating {label.toLowerCase()}.</desc>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.02" />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g
          style={
            { "--model-gradient": `url(#${gradientId})`, "--model-glow": `url(#${glowId})` } as CSSProperties
          }
        >
          {modelFor(type)}
        </g>
      </svg>
    </div>
  );
}
