const prompts = require("prompts");

let state=0

async function main(){
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, win INTEGER NOT NULL, lose INTEGER NOT NULL, winrate REAL NOT NULL)');
  while(true){
    if(state==0){
      await displayMenu()
    }else if(state==1){
      await addNewPlayer()
    }else if(state==2){
      await recordMatch()
    }else if(state==3){
      await checkLeaderBoard()
    }else{
      db.close((err) => {
        if (err) {
          console.error(err.message)
        }
  
        process.exit()
      })
      break
    }
  }
}
main()

async function displayMenu(){
  const response  = await prompts({
    type:'select',
    name:'menus',
    actions:[
      {title:'Add new player',value:1},
      {title:'Record a match',value:2},
      {title:'Check leaderboard',value:3},
      {title:'Exit',value:4}
    ]
  })
  state = response.value;
  console.log('state',state)
}

async function addNewPlayer(){
  const response = await prompts({
		type: 'text',
		name: 'value',
		message: `Enter player's name.`
	})

	if (!response.value){
		console.error('Please enter valid name.')
		return
	}

	db.run('INSERT INTO users (name,win,lose,winrate) VALUES (?,?,?,?)',[response.value,0,0,0],(err)=>{
		if (err) {
			console.error(err.message)
		}
	})
}

async function recordMatch(){
  
}

async function checkLeaderBoard(){

}



