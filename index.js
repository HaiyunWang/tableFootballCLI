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
  
}

async function addNewPlayer(){
  
}

async function recordMatch(){
  
}

async function checkLeaderBoard(){

}



