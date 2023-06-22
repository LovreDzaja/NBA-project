$(document).ready(function(){
    let lang = navigator.language;
    const teamContainer = document.querySelector(".teams");
    const overlay = document.querySelector(".overlay");	
    const close = document.querySelector(".close");	
    let clickedTeam = []

    function clearCache() {
        if ('caches' in window) {
            caches.keys().then(function (cacheNames) {
                cacheNames.forEach(function (cacheName) {
                    caches.delete(cacheName);
                });
            });
        }
    }
    
    window.addEventListener("load", () => {
        clearCache();
        overlay.classList.add("active_overlay");
    });
    
    window.addEventListener("load", () => {
        overlay.classList.add("active_overlay");
    });
    
    $.getJSON("https://www.thesportsdb.com/api/v1/json/40130162/lookup_all_teams.php?id=4387", function(dataTeam){
        console.log(dataTeam);
        var output = "";
        for (var i in dataTeam.teams){
            const div = document.createElement("div");
            div.classList.add("teams-item");
            div.teamID = dataTeam.teams[i].idTeam;
            div.addEventListener("click", selectedTeam);
         const output = `
                <span class="teams-item-logo"><img src="${dataTeam.teams[i].strTeamBadge}" alt=""></span>
                <span class="teams-item-info">
                <span class="teams-item-short">${dataTeam.teams[i].strTeamShort}</span>
                <span class="teams-item-name">${dataTeam.teams[i].strTeam}</span>
                </span>
                    
            `;
        div.innerHTML = output;
        teamContainer.append(div);
        
        
        }

        function selectedTeam(e){
            const clicked = e.target.closest(".teams-item");
            clickedTeam.unshift(clicked.teamID);
            if(clicked.teamID === clickedTeam[clickedTeam.length -1]){
                clicked.style.backgroundColor = "var(--blk)";
                console.log(clickedTeam);
            }
                teamInfoGet(clicked.teamID);
                clicked.style.backgroundColor = "var(--blk)";
                close.style.cursor = "pointer";
        }
        
        function teamInfoGet(teamID){
            $.getJSON("https://www.thesportsdb.com/api/v1/json/40130162/lookupteam.php?id="+teamID+"",function(data){
                const team = data.teams[0];
                const teamNav = document.querySelector(".team_nav");
                const spanClose = document.querySelector(".close-span");
                const result = `
                    <span class="team_nav-span">
                    <span class="team_nav-icon"><img src="${team.strTeamBadge}" alt=""></span>
                    <span class="team_nav-short">${team.strTeamShort}</span>
                    </span>
                `;
                teamNav.innerHTML = result;
                spanClose.innerHTML = `<span class="team-selected_close">View ${team.strTeam}</span>`;
                close.addEventListener("click", () => {
                    overlay.classList.remove("active_overlay");
                });
                // lay info
                teamDesc(team.idTeam);
                nextGame(team.idTeam);
                previousGames(team.idTeam);
                teamVisuals(team.idTeam);
                scheduledGames(team.idTeam);
                teamPlayers(team.idTeam);
            });
        }
        async function previousGames(gameID){
            const O_recentGames = document.querySelector(".o_games-items");
            const G_recentGames = document.querySelector(".g_games-items");
            $.getJSON("https://www.thesportsdb.com/api/v1/json/40130162/eventslast.php?id="+gameID+"",function(data){
                const games = data.results;
                O_recentGames.innerHTML = "";
                G_recentGames.innerHTML = "";
                games.forEach((game)=>{
                    const result = `<span class="o_games-item">
                                <span class="o_games-item-home o_game" style='${
                                    game.intHomeScore > game.intAwayScore
                                        ? "font-weight:500"
                                        : "font-weight:100"
                                };'>
                                    <span class="o_team">${game.strHomeTeam}</span> <span class="o_score">${
            game.intHomeScore
        }</span>
                                </span>
                                <span class="o_games-item-home o_game" style='${
                                    game.intHomeScore < game.intAwayScore
                                        ? "font-weight:500"
                                        : "font-weight:100"
                                };'>
                                    <span class="o_team">${game.strAwayTeam}</span> <span class="o_score">${
            game.intAwayScore
        }</span>
                                </span>
                            </span> `;
                O_recentGames.insertAdjacentHTML("afterbegin", result);
                G_recentGames.insertAdjacentHTML("afterbegin", result);
                })
            })
        }
        async function nextGame(game){
            const upcomingGame = document.querySelector(".upcoming_game");
            const liveContainer = document.querySelector(".live");
        

            $.getJSON("https://www.thesportsdb.com/api/v1/json/40130162/eventsnext.php?id="+game+"",function(fetched){
                upcomingGame.innerHTML = "";
                if(fetched.events == null){
                    upcomingGame.style.display = "none";
                    liveContainer.style.display = "none";
                }else{
                    upcomingGame.style.display = "block";
                const next = fetched.events[0];
                console.log(next);
                //verifyLiveGame(next.idEvent);
                const date = next.strTimestamp;
                const dateLocal = new Date(date);
                const localTime = dateLocal.toLocaleDateString(`${lang}`, {
                    weekday: "long",
                    hour: "numeric",
                    minute: "numeric"
                });

                const mockup = `<div class="upcoming_game-item">
                                    <span class="upcoming_game-item-headline">${next.strEventAlternate}</span>
                                    <span class="upcoming_game-item-time">${localTime}</span>
                                </div>`;
                upcomingGame.style.backgroundImage = `url("${
                    next.strThumb
                        ? next.strThumb
                        : "https://assets.codepen.io/2629920/photo-1504450758481-7338eba7524a.jpeg"
                }")`;
                upcomingGame.innerHTML = mockup;
                }
            })
        }
        async function fetchedTabs(e) {
            const navItem = document.querySelectorAll(".nav-item");
            const contentTabs = document.querySelectorAll(".content");
            const clicked = e.target.closest(".nav-item");
            if (!clicked) return;
            navItem.forEach((i) => i.classList.remove("nav-item-active"));
            contentTabs.forEach((tab) => tab.classList.remove("content-active"));
            clicked.classList.add("nav-item-active");
            const dataSet = clicked.dataset.type;
            document.querySelector(`.data-${dataSet}`).classList.add("content-active");
        }
        async function teamVisuals(id){
            $.getJSON("https://www.thesportsdb.com/api/v1/json/40130162/lookupteam.php?id="+id+"",function(data){
                const rightDash = document.querySelector(".dash-right");
                const fetchedInfo = document.querySelector(".fetched_info");
                const navContainer = document.querySelector(".nav-items");
                const divhdr = document.createElement("div");
                const team = data.teams[0];
                divhdr.classList.add("hdr");
                divhdr.style.backgroundImage = `url('${data.strStadiumThumb}')`; 
                rightDash.append(divhdr);
                fetchedInfo.style.display = "block";
                navContainer.addEventListener("click", fetchedTabs);
            })
        }
        async function teamDesc(id){
            $.getJSON("https://www.thesportsdb.com/api/v1/json/40130162/lookupteam.php?id="+id+"",function(data){
                try{
                const O_desc = document.querySelector(".o_desc");
                const team = data.teams[0];
                O_desc.innerHTML = "";
                const respond = `<span class="o_desc-span">${team.strDescriptionEN}</span>`;
                O_desc.insertAdjacentHTML("afterbegin", respond);
                }catch(e){
                    console.log(e)
                }
            });
        }
        async function scheduledGames(teamID){
            $.getJSON("https://www.thesportsdb.com/api/v1/json/40130162/eventsnext.php?id="+teamID+"",function(captured){
                const team = captured;
                console.log(team)
                const G_scheduledGames = document.querySelector(".g_schedule-games");
                const scheduleHdr = document.querySelector(".schedule-hdr");
                G_scheduledGames.innerHTML = "";
                if(team.events === null ) return (scheduleHdr.style.display = "none");
                else{
                    scheduleHdr.style.display = "block";
                    team.events.forEach(event=>{
                        const date = event.strTimestamp;
                        const dateLocal = new Date(date);
                        const localtime = dateLocal.toLocaleDateString(`${lang}`,{
                            weekday: "long",
                            hour: "numeric",
                            minute: "numeric",
                            month: "long",
                            day: "numeric"
                        });
                        const result = `<div class="schedule-game">
                            <span class="schedule-game-TV">${
                                event.strTVStation ? `Watch it on ${event.strTVStation}` : ""
                            }</span>
                            <div class="schedule-game-left">
                                <span class="o_games-item-home o_game">
                                    <span class="o_team">${event.strHomeTeam} <span class="homeTeam">H</span></span>
                                </span>
                                <span class="o_games-item-home o_game">
                                    <span class="o_team">${event.strAwayTeam} <span class="awayTeam">A</span></span>
                                </span>
                            </div>
                            <div class="schedule-game-right">
                                <div class="schedule-game-time">${
                                    event.intHomeScore ? event.intHomeScore : localtime
                                }</div>
                                <div class="schedule-game-date">${
                                    event.intAwayScore ? event.intAwayScore : ""
                                }</div>
                            </div>

                        </div>`;
                        G_scheduledGames.insertAdjacentHTML("afterbegin",result);
                    })
                    if (event.intHomeScore) {
                scheduleHdr.style.display = "none";
            }
                        
                    
                    
                }
            
            })
        }
        async function teamPlayers(id){
            const playersList = document.querySelector(".players");
            $.getJSON("https://www.thesportsdb.com/api/v1/json/40130162/lookup_all_players.php?id="+id+"",function(res){
                for(const prop in res){
                    const players = res[prop]
                    playersList.innerHTML = "";
                    players.forEach((player)=>{
                        const div = document.createElement("div");
                        div.classList.add("players-item");
                        if(player.strPosition === "Manager"){
                            div.classList.add("manager");
                        }
                        const respond = `
                        <div class="players-item-image"><img src="${player.strThumb}" alt=""></div>
                            <div class="players-item-desc">
                                <div class="players-name">${player.strPlayer}</div>
                                <div class="players-position">${player.strPosition}</div>
                            </div>`;
                        div.innerHTML = respond;
                        playersList.append(div);
                    })
                }
        })
        }
    })
})