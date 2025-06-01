import React from 'react'

interface Platform {
	id: number,
	name: string,
	slug: string
}

interface Game {
	slug: string;
	name: string;
	parent_platforms: Platform[]
}

const GamesList = async () => {
	const res = await (await fetch('http://localhost:4000/api/games')).json();
	const games: Game[] = res.results;

 	return (
    	<div className='games-list'>
			<ul>
				{games.map((game) => (
				<li key={game.slug}>{game.name}</li>
				))}
			</ul>
		</div>
  	)
}

export default GamesList;
