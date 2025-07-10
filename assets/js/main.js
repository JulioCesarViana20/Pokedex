const pokemonList = document.getElementById('pokemonList');
const loadMoreButton = document.getElementById('loadMoreButton');
const popup = document.getElementById('pokemonPopup');

const maxRecords = 151;
const limit = 10;
let offset = 0;

let allPokemons = [];

// Função para pegar detalhes do pokemon (stats) pela API PokeAPI
async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        // Extrai os stats de interesse: hp, attack, defense
        const stats = {};
        data.stats.forEach(stat => {
            if(stat.stat.name === 'hp') stats.hp = stat.base_stat;
             if(stat.stat.name === 'attack') stats.attack = stat.base_stat;
            if(stat.stat.name === 'defense') stats.defense = stat.base_stat;
        });
        return stats;
    } catch (error) {
        console.error('Erro ao buscar detalhes do Pokémon:', error);
        return { hp: 'não encontrado ou em desenvolvimento.', attack: 'não encontrado ou em desenvolvimento.', defense: 'não encontrado ou em desenvolvimento.' };
    }
}


function convertPokemonToLi(pokemon) {
    return `
        <li class="pokemon ${pokemon.type}" data-name="${pokemon.name}">
            <span class="number">#${pokemon.number}</span>
            <span class="name">${pokemon.name}</span>

            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map(type => `<li class="type ${type}">${type}</li>`).join('')}
                </ol>

                <img src="${pokemon.photo}" alt="${pokemon.name}">
            </div>
        </li>
    `;
}

function showPokemonStats(pokemon, event) {
    popup.innerHTML = `
        <div style="text-align: center;">
            <strong style="font-size: 16px;">${pokemon.name.toUpperCase()}</strong><br>
            <img src="${pokemon.photo}" alt="${pokemon.name}" style="width: 80px; height: 80px;"><br><br>
        </div>
        <div style="font-size: 14px; line-height: 1.6;">
            <strong>Número:</strong> #${pokemon.number}<br>
            Vida: ${pokemon.hp}<br>
            Ataque: ${pokemon.attack}<br>
            Defesa: ${pokemon.defense}
        </div>
    `;

    popup.style.top = (event.clientY + 10) + 'px';
    popup.style.left = (event.clientX + 10) + 'px';
    popup.style.display = 'block';
}

async function loadPokemonItens(offset, limit) {
    // Aqui busca pokemons básicos (nome, foto, tipos, url)
    const pokemonsBasicos = await pokeApi.getPokemons(offset, limit);

    // Agora busca detalhes de cada pokemon para pegar stats e adiciona no objeto
    const pokemonsCompletos = await Promise.all(
        pokemonsBasicos.map(async (p) => {
            const details = await fetchPokemonDetails(p.url);
            return {
                ...p,
                hp: details.hp,
                attack: details.attack,
                defense: details.defense,
            };
        })
    );

    allPokemons = allPokemons.concat(pokemonsCompletos);

    const newHtml = pokemonsCompletos.map(convertPokemonToLi).join('');
    pokemonList.innerHTML += newHtml;
}

pokemonList.addEventListener('click', (event) => {
    const li = event.target.closest('.pokemon');
    if (!li) return;

    const pokemonName = li.getAttribute('data-name');
    const pokemon = allPokemons.find(p => p.name === pokemonName);

    if (pokemon) {
        showPokemonStats(pokemon, event);
    }
});

document.addEventListener('click', (event) => {
    if (!event.target.closest('.pokemon') && !event.target.closest('#pokemonPopup')) {
        popup.style.display = 'none';
    }
});

loadPokemonItens(offset, limit);

loadMoreButton.addEventListener('click', () => {
    offset += limit;
    const qtdRecordsWithNextPage = offset + limit;

    if (qtdRecordsWithNextPage >= maxRecords) {
        const newLimit = maxRecords - offset;
        loadPokemonItens(offset, newLimit);
        loadMoreButton.parentElement.removeChild(loadMoreButton);
    } else {
        loadPokemonItens(offset, limit);
    }
});
