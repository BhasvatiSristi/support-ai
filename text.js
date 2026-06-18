const mongoose = require("mongoose");

mongoose.connect(
  "mongodb://bhasvati2106_db_user:XaiTvX6NYf9w1sSs@ac-qkyzf9o-shard-00-00.9vag8j2.mongodb.net:27017,ac-qkyzf9o-shard-00-01.9vag8j2.mongodb.net:27017,ac-qkyzf9o-shard-00-02.9vag8j2.mongodb.net:27017/?ssl=true&replicaSet=atlas-hzxgc9-shard-0&authSource=admin&appName=Cluster0"
)
.then(() => {
  console.log("Connected");
})
.catch(err => {
  console.error(err);
});