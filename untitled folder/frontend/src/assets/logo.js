import React from 'react';

const Logo = ({ width = 200, height = 200, color = '#1A237E' }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 500 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M250 50C139.543 50 50 139.543 50 250C50 360.457 139.543 450 250 450C360.457 450 450 360.457 450 250C450 139.543 360.457 50 250 50Z"
      stroke={color}
      strokeWidth="20"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M250 150C215.147 150 187 178.147 187 213C187 247.853 215.147 276 250 276C284.853 276 313 247.853 313 213C313 178.147 284.853 150 250 150Z"
      fill={color}
    />
    <path
      d="M250 300C180.442 300 124 356.442 124 426M376 426C376 356.442 319.558 300 250 300"
      stroke={color}
      strokeWidth="20"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M187 213C187 178.147 215.147 150 250 150C284.853 150 313 178.147 313 213"
      stroke={color}
      strokeWidth="20"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M150 100L350 100M150 400L350 400"
      stroke={color}
      strokeWidth="20"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Logo;
