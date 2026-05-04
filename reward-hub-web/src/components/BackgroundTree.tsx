import './BackgroundTree.css';

export function BackgroundTree() {
  const leaves = Array.from({ length: 20 });

  return (
    <div className="background-tree-container">
      <svg className="tree-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
        {/* Trunk */}
        <path className="tree-trunk" d="M190,400 C190,300 195,200 200,100 C205,200 210,300 210,400 Z" fill="#6B4423" />
        
        {/* Branches */}
        <path className="tree-branch" d="M200,250 C180,220 150,200 120,180" stroke="#6B4423" strokeWidth="12" strokeLinecap="round" fill="none" />
        <path className="tree-branch" d="M205,280 C230,240 260,220 290,190" stroke="#6B4423" strokeWidth="10" strokeLinecap="round" fill="none" />
        <path className="tree-branch" d="M198,180 C170,160 140,140 120,110" stroke="#6B4423" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path className="tree-branch" d="M202,150 C230,130 250,110 270,80" stroke="#6B4423" strokeWidth="7" strokeLinecap="round" fill="none" />

        {/* Leaves / Crown */}
        <g className="tree-crown">
          <circle cx="200" cy="70" r="50" fill="#4CAF50" opacity="0.9" />
          <circle cx="130" cy="110" r="60" fill="#43A047" opacity="0.9" />
          <circle cx="270" cy="90" r="55" fill="#388E3C" opacity="0.9" />
          <circle cx="100" cy="170" r="45" fill="#4CAF50" opacity="0.9" />
          <circle cx="290" cy="180" r="50" fill="#43A047" opacity="0.9" />
          <circle cx="160" cy="140" r="65" fill="#2E7D32" opacity="0.9" />
          <circle cx="240" cy="150" r="65" fill="#4CAF50" opacity="0.9" />
        </g>
      </svg>
      
      {leaves.map((_, i) => (
        <div key={i} className={`falling-leaf leaf-${i}`} />
      ))}
    </div>
  );
}
