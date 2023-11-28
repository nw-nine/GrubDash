const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res, next) {
    res.send({ data: dishes })
}

function validateDish(req, res, next) {
    const { name, description, price, image_url } = req.body.data;
    if (!name) {
        return res.status(400).json({ error: 'Dish must include a name' });
    }
    if (!description) {
        return res.status(400).json({ error: 'Dish must include a description' });
    }
    if (!price || price <= 0 || !Number.isInteger(price)) {
        return res.status(400).json({ error: 'Dish must have a price that is an integer greater than 0' });
    }
    if (!image_url) {
        return res.status(400).json({ error: 'Dish must include an image_url' });
    }
}

function create(req, res, next) {
    const { name, description, price, image_url } = req.body.data;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url
    }
    dishes.push(newDish)

    res.status(201).json({ data: newDish })
}

function read(req, res, next) {
    const { dishId } = req.params
    const foundDish = dishes.find(dish => dish.id === dishId)

    if(!foundDish) {
        res.status(404).json({ error: `Dish does not exist: ${dishId}.`})
    }
    res.status(200).json({ data: foundDish })  
}


module.exports = {
    list,
    create: [validateDish, create],
    read,
}