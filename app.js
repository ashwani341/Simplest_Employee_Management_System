const express = require('express')
const parser = require('body-parser')
const morgan = require('morgan')
const app = express()
const port = 5000

const { MongoClient } = require('mongodb')
const uri = 'mongodb://127.0.0.1/'
const client = new MongoClient(uri)
const dbName = 'empDB'


// -- START utilitu fn -----------------------------------------------------------------------------------------------------
const file = fileName => {
  return `${__dirname}/src/${fileName}.html`
}
// -- END utilitu fn -----------------------------------------------------------------------------------------------------


// -- START mongoDB connection -----------------------------------------------------------------------------------------------------
async function connectMongoDB() {
  try {

    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Establish and verify connection
    await client.db(dbName).command({ ping: 1 });
    db = await client.db(dbName); // providing db to the global context
    console.log("Connected successfully to mongoDB");

  } catch {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
connectMongoDB().catch(console.error)
// -- END mongoDB connection -----------------------------------------------------------------------------------------------------


// -- START middelware config -----------------------------------------------------------------------------------------------------
app.use(morgan('dev')) // api logging middleware

app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())  // parses the form body into json
// -- END middelware config -----------------------------------------------------------------------------------------------------


// -- START api routes -----------------------------------------------------------------------------------------------------
app.get('/', (req, res) => res.sendFile(file('index')))


app.get('/employees', async (req, res) => {

  const data = await db.collection('employees').find().toArray()

  res.json({ data })

})


app.post('/newEmployee', async (req, res) => {

  const empObj = {
    id: parseInt(req.body.id),
    name: req.body.name,
    address: req.body.address,
    salary: req.body.salary
  }

  // creating a new record in the database
  const result = await db.collection('employees').insertOne(empObj)

  // if not inserted
  if(!result.acknowledged) return res.status(500).send('Something went wrong!')
  // if inserted successfully
  res.send('New employee created!')

})


app.put('/updateEmployee', async (req, res) => {
  const id = parseInt(req.body.id)

  const empObj = {
    name: req.body.name,
    address: req.body.address,
    salary: req.body.salary
  }

  // creating a new record in the database
  const result = await db.collection('employees').updateOne({ id }, {$set: empObj})
  // console.log(result)

  // if not inserted
  if(!result.acknowledged) return res.status(500).send('Something went wrong!')
  // if inserted successfully
  res.send('New employee created!')

})


app.delete('/employees/:id', async (req, res) => {
  const id = parseInt(req.params.id)

  const result = await db.collection('employees').deleteOne({id})
  console.log(result)

  // if not deleted
  if(!result.acknowledged || result.deletedCount == 0) return res.status(500).send('Something went wrong!')
  // if deleted successfully
  res.send('Employee deleted successfully!')
})
// -- END api routes -----------------------------------------------------------------------------------------------------


// server starts here
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})