import React from 'react';

const BrowseGamesIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <div><svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="#000000"
      {...props}
    >
      <defs>
        <style>
          {`
            .b { fill: #000000; }
            .c { 
              fill: none; 
              stroke: #FFFFFF; 
              stroke-linecap: round; 
              stroke-linejoin: round; 
              stroke-width: 1.25; 
            }
          `}
        </style>
      </defs>
      <g>
        <line className="c" x1="7.125" y1="11.8474" x2="7.125" y2="9.134" />
        <line className="c" x1="5.7683" y1="10.4907" x2="8.4817" y2="10.4907" />
        <path
          className="c"
          d="m8.5935,6.846v-.8064c0-.2905-.2355-.526-.526-.526h-1.8849c-.2905,0-.526.2355-.526.526v.8854"
        />
        <path
          className="c"
          d="m14.5218,13.8677l2.2767,3.415c.7425,1.1138,2.1885,1.5162,3.3996.946,1.1335-.5336,1.7521-1.7738,1.4937-2.9997-.4921-2.3353-.8846-4.513-1.2863-5.9913-.4229-1.5562-1.9418-2.6402-3.6421-2.6402-1.0261,0-1.9557.4054-2.6438,1.0618h-4.239c-.6881-.6564-1.6178-1.0618-2.6438-1.0618-1.7003,0-3.2193,1.084-3.6421,2.6402-.4017,1.4783-.7942,3.656-1.2863,5.9913-.2584,1.2259.3602,2.4661,1.4937,2.9997,1.2111.5702,2.6571.1678,3.3996-.946l2.2767-3.415h5.0435Z"
        />
        <path
          className="c"
          d="m15.4065,6.846v-.8064c0-.2905.2355-.526.526-.526h1.8849c.2905,0,.526.2355-.526.526v.8854"
        />
        <circle className="b" cx="15.515" cy="10.4907" r=".375" />
        <circle className="b" cx="18.2317" cy="10.4907" r=".375" />
        <circle className="b" cx="16.875" cy="9.134" r=".375" />
      </g>
    </svg></div>
    
  );
};

export default BrowseGamesIcon;