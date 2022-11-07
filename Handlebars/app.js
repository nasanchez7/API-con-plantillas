const fs = require('fs');

class Contenedor{
    constructor(archivo, id ){
        this.archivo = `./${archivo}.txt`
        this.id = 1
    }

    async save(objeto){
        try{
            if(!fs.existsSync(this.archivo)) {
                await fs.promises.writeFile(this.archivo, JSON.stringify([
                    {
                        id: this.id,
                        ...objeto
                    }
                ]));
                return `Has agregado ${objeto.title} con el id ${this.id}`
            }else{
                const archivo = await fs.promises.readFile(this.archivo, 'utf-8')
                const json = JSON.parse(archivo);
                if(json.length > 0){
                    json.push({
                        id: json.length + 1,
                        ...objeto
                    })
                    await fs.promises.writeFile(this.archivo, JSON.stringify(json))
                    return { msj: `Has agregado ${objeto.title} con el id ${json.length}`}
                }
            }
        }
        catch(e){
            console.log(`Ha habido un error al leer el archivo ${this.archivo}`)
        }
    }

    async getById(id){
        try {
            const archivo = await fs.promises.readFile(this.archivo, 'utf-8')
            const json = JSON.parse(archivo);
            if (json.length > 0) {
                const obj = json.find(obj => obj.id === id)
                if (obj){
                    return obj
                }else{
                    return {error: "producto no encontrado"}
                } 
            }
        } catch (error) {
            console.log(error)
        }
    }

    async getAll(){
        try {
            const archivo = await fs.promises.readFile(this.archivo, 'utf-8')
            const json = JSON.parse(archivo);
            if (json.length > 0) {
                return json
            }
            console.log("Archivo vacio")
        } catch (error) {
            console.log(error)
        }
    }

    async deleteById(id){
        try {
            const archivo = await fs.promises.readFile(this.archivo, 'utf-8')
            const json = JSON.parse(archivo);
            if (json.length > 0) {
                const index = json.findIndex(obj => obj.id === id)
                if (index === -1) {
                    console.log(`El objeto no existe`)
                } else {
                    json.splice(index, 1)
                    await fs.promises.writeFile(this.archivo, JSON.stringify(json))
                }
            }
        }catch(error){
            console.log(error)
        } 
    } 

    async deleteAll(){
        try {
            await fs.promises.writeFile(this.archivo, "[]")
        } catch (error) {
            console.log(error)
        }
    }

}

const archivo = new Contenedor("productos");


const express = require('express');
const { Router } = express;
const handlebars = require('express-handlebars');
const app = express()
const router = Router();

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('/api/productos', router)
app.use(express.static(__dirname + '/public'))

const PORT = 8080

app.engine(
    "hbs",
    handlebars.engine({
        extname: ".hbs",
        defaultLayout: "index.hbs",
        layoutsDir: __dirname + "/views/layouts",
        partialsDir: __dirname + "/views/partials"
 })
);

app.set('views', './views'); 
app.set('view engine', 'hbs'); 


app.get('/', (req, res)=>{
    res.render('main', {})
}) 

router.get('/', async (req, res) => {
    const productos = await archivo.getAll()
    res.render('productos', {
        productos: productos
    });
})

router.post('/', async (req, res) => {
    const producto = req.body;
    await archivo.save(producto)
    res.render('main', {})
})


const server = app.listen(PORT, ()=>{
    console.log(`Servidor abierto en el puerto ${server.address().port}`)
})
server.on("error", error => console.log(error)) 
