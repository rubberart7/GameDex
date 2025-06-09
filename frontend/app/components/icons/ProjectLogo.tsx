import React from 'react'

const ProjectLogo = () => {
  return (
    <div>
        <img src="/assets/game_logo.png" alt="game logo" 
        style={{ display: 'block',  // removes default inline spacing under images
    width: '175px',    // or whatever size you want
    height: 'auto',
    margin: 0,
    padding: 0,
    border: 'none',}}/>
    </div>
  )
}

export default ProjectLogo;
