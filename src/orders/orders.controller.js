const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list (req, res, next) {
    res.send({ data: orders })
}
function validateOrder(req, res, next) {
    const { deliverTo, mobileNumber, dishes } = req.body.data;
    if (!deliverTo) {
        return res.status(400).json({ error: 'Order must include a deliverTo' });
    }
    if (!mobileNumber) {
        return res.status(400).json({ error: 'Order must include a mobileNumber' });
    }
    if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
        return res.status(400).json({ error: 'Order must include at least one dish' });
    }
    dishes.forEach((dish, index) => {
        const { quantity } = dish;
        if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
            return res.status(400).json({ error: `Dish ${index} must have a quantity that is an integer greater than 0` });
        }
    });
    next();
}

function create(req, res, next) {
    const { deliverTo, mobileNumber, status, dishes } = req.body.data;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes,
    }
    orders.push(newOrder)

    res.status(201).json({ data: newOrder })
}

function validateOrderExists(req, res, next) {
    let { orderId } = req.params;
    let index = orders.findIndex(order => order.id === orderId);
    if (index < 0 || index >= orders.length) {
      // bad news
      next({
        status: 404,
        message: `could not find order with id ${orderId}`
      })
    } else {
      // we found it! save its location for later
      res.locals.index = index;
      next();
    }
}

function read (req, res, next) {
    res.send({ data: orders[res.locals.index] })
}

function destroy (req, res, next) {
   let { index } = res.locals
   const order = orders[index]
   if(!order) {
    res.status(404).json({ error: 'Could not find order for deletion'})
   }
   if(order.status !== 'pending') {
    res.status(400).json({ error: 'An order cannot be deleted unless it is pending'})
   }
   orders.splice(index, 1)
   res.status(204).send()
}

function validateUpdate(req, res, next) {
    const { orderId } = req.params;
    const { id, status } = req.body.data;
    const orderIdToUpdate = id || orderId
    if (orderIdToUpdate !== orderId) {
        next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
        }) 
    }
    if (!status || !["pending", "preparing", "out-for-delivery", "delivered"].includes(status)) {
        next({
            status: 400,
            message: 'Order must have a status of pending, preparing, out-for-delivery, delivered'
        })
    }
    const index = orders.findIndex(order => order.id === orderId);

    if (index === -1) {
        next({
            status: 404,
            message: `Could not find order with id ${orderId}`
        })
    }
    if (orders[index].status === 'delivered') {
        next({
            status: 400,
            message: 'A delivered order cannot be changed'
        })
    }
    next();
}

function update(req, res, next) {
    const { orderId } = req.params;
    const { deliverTo, mobileNumber, status, dishes } = req.body.data;
    const updatedOrder = {
        id: orderId,
        deliverTo,
        mobileNumber,
        status,
        dishes,
    };
    const index = orders.findIndex(order => order.id === orderId);
    orders[index] = updatedOrder;

    res.json({ data: updatedOrder });
}



module.exports = {
    list,
    create: [validateOrder, create],
    read: [validateOrderExists, read],
    destroy: [validateOrderExists, destroy],
    update: [validateOrderExists, validateOrder, validateUpdate, update]
}