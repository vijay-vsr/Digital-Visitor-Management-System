const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.VERCEL
  ? path.join('/tmp', 'vms.db')
  : path.join(__dirname, 'vms.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

/**
 * Executes a query that returns multiple rows
 * @param {string} sql 
 * @param {Array|Object} params 
 * @returns {Array}
 */
function query(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...(Array.isArray(params) ? params : [params]));
}

/**
 * Executes a query that returns a single row
 * @param {string} sql 
 * @param {Array|Object} params 
 * @returns {Object|null}
 */
function get(sql, params = []) {
  const stmt = db.prepare(sql);
  const result = stmt.get(...(Array.isArray(params) ? params : [params]));
  return result || null;
}

/**
 * Executes an INSERT, UPDATE, or DELETE statement
 * @param {string} sql 
 * @param {Array|Object} params 
 * @returns {{ changes: number, lastInsertRowid: number|bigint }}
 */
function run(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...(Array.isArray(params) ? params : [params]));
}

/**
 * Executes arbitrary multi-statement SQL
 * @param {string} sql 
 */
function exec(sql) {
  return db.exec(sql);
}

/**
 * Initializes tables from schema.sql
 */
function initDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schemaSql);
}

module.exports = {
  db,
  query,
  get,
  run,
  exec,
  initDatabase,
};
