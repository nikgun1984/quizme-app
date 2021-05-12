"use strict";

const express = require("express");
const cors = require("cors");

const morgan = require("morgan");

const app = require("express");

app.request(cors());
app.use(express.json());
app.use(morgan("tiny"));

module.exports = app;
