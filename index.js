const prompts = require("prompts");
const fs=require('fs');
if (!fs.existsSync('gameRecord.db')){
	fs.writeFileSync('gameRecord.db', '');
}

var sqlite3 = require('sqlite3').verbose();
let db=new sqlite3.Database('./gameRecord.db',(err)=>{
	if (err) {
		console.error(red(err.message))
	}
});

async function main(){
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, win INTEGER NOT NULL, lose INTEGER NOT NULL, winrate REAL NOT NULL)');
  while(true){
    let state = await displayMenu()
    console.log('state',state)
    if(state==1){
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

main();


async function displayMenu(){
  console.log('displayMenu')
  const response  = await prompts({
    type:'select',
    name:'value',
    message:'Choose your action',
    choices:[
      {title:'Add new player',value:1},
      {title:'Record a match',value:2},
      {title:'Check leaderboard',value:3},
      {title:'Exit',value:4}
    ]
  })
  return response.value;
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
  return new Promise((resolve,reject)=>{
    const sql='SELECT * FROM users ORDER BY id ASC'
    db.all(sql,async (err,rows)=>{
			if (err){
				console.error(err.message)
				resolve(false)
				return
			}

			if (rows.length<=1){
				let response = await prompts({
					type: 'confirm',
					name: 'value',
					message: 'Must have two or more players. Do you wanna add a new player?',
					initial: true
				})

				resolve(false)
				return
					
			}

			const response = await prompts({
				type: 'select',
				name: 'value',
				message: "Who's the winner?",
				choices: rows.map((row)=>{
					return {
						title: row.name,
						value: row.id
					}
				}),
				initial: 0
			})

			if (!response.value){
				resolve(false)
				console.error('Unexpected Input')
				return
			}

			let winner=rows.filter(row=>row.id==response.value)[0]

			const response2 = await prompts({
				type: 'select',
				name: 'value',
				message: "Who's the loser?",
				choices: rows.map((row)=>{
					return {
						title: row.name,
						value: row.id
					}
				}),
				initial: 0
			})

			if (!response2.value){
				resolve(false)
				console.error('Unexpected Input')
				return
			}

			let loser=rows.filter(row=>row.id==response2.value)[0]

			if (winner.id==loser.id){
				console.error('You can not play against yourself')
				resolve(false)
				return
			}

			const confirmRecordResponse = await prompts({
				type: 'toggle',
				name: 'value',
				message: `Are you sure you want to record ${winner.name} as winner and ${loser.name} as loser?`,
				initial: true,
				active: 'yes',
				inactive: 'no'
			})

			if (!confirmRecordResponse.value){
				console.log('Aborted')
				resolve(false)
				return
			}
			
			winner.win+=1
			loser.lose+=1

			winner.winrate=((winner.win/(winner.win+winner.lose))*100).toFixed(1)
			loser.winrate=((loser.win/(loser.win+loser.lose))*100).toFixed(1)

			const sql2='UPDATE users SET win=?, lose=?, winrate=? WHERE id=?'
			db.run(sql2,[winner.win,winner.lose,winner.winrate,winner.id])
			db.run(sql2,[loser.win,loser.lose,loser.winrate,loser.id])

			resolve(true)
			
		})
  })
  
}

async function checkLeaderBoard(){
  const sql='SELECT * FROM users ORDER BY winrate DESC, win DESC, lose DESC'
  return new Promise((resolve,reject)=>{
		db.all(sql,async (err,rows)=>{
			if (err){
				console.error(err.message)
				resolve(false)
				return
			}

			if (rows.length<=0){
				let response = await prompts({
					type: 'confirm',
					name: 'value',
					message: 'Database is empty.! Do you wanna add a new player?',
					initial: true
				})
				resolve(false)
        if(response.value){
          state=1
        }
				return		
			}

			console.table(rows)
	
			const response = await prompts({
				type: 'confirm',
				name: 'value',
				message: 'Do you want to go back?',
				initial: true
			})
      if(response.value){
        state = 0
      }
			resolve(true)
		})

	})
}



