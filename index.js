/**
 * author: zto
 * mock 服务工具类
 * date: 2019-09-18 星期三
 */

const fs = require('fs');
const mockDir = "./mock/data/";
let _req, _res;

/**
 * 
 * @param {String||Object} option 
   String: filename
   Object:{
      rules: [
        {
          rule: [
            { name: "username", val: "zto" },
            { name: "password", val: "zto" }
          ],
          file: "success"
        },
        {
          rule: [
            { name: "username", val: "zt" }
          ],
          file: "error"
        }
     ],
     dir: "app/"
  }
 * @param {*} childDir 
 */
function loadJson(option, childDir) {
  let filename;
  return (req, res) => {
    switch (Object.prototype.toString.call(option)) {
      case "[object String]":
        filename = option;
        break;
      case "[object Object]":
        _req = req;
        _res = res;
        filename = parseRuleGroup(option.rules);
        childDir = option.dir;
        break;
    }
    if (filename) {
      return res.json(_load(filename, childDir));
    } else {
      return res.json(_load("notFound"));
    }
  };
}

/**
 * 加载指定目录下的文件
 * @param {*} filename 
 * @param {*} childDir 
 */
function _load(filename, childDir) {
  childDir = childDir || ""
  const data = fs.readFileSync(`${mockDir + childDir + filename}.json`).toString();
  return JSON.parse(data);
}

/**
 * 解析条件规则，满足条件验证后，输出对应的相应数据
 * @param {*} op 
 案例:{
      rules: [
        {
          rule: [
            { name: "username", val: "zto" },
            { name: "password", val: "zto" }
          ],
          file: "success"
        },
        {
          rule: [
            { name: "username", val: "zt" }
          ],
          file: "error"
        }
     ],
     dir: "app/"
  }
 */
function parseRuleGroup(rules) {
  for (let i = 0; i < rules.length; i++) {
    if (parseRule(rules[i])) {
      return rules[i].file;
    }
  }
}

/**
 * 
 * 解析一组规则
 * @param {*} data 
 案例：
{
  rule: [
    { name: "username", val: "zto" }
    { name: "password", val: "zto" }
  ],
  file: "success"
}
*/
function parseRule(data) {
  var status = true;
  for (let i = 0; i < data.rule.length; i++) {
    let item = data.rule[i];
    if (!validRule(item)) {
      status = false;
      break;
    }
  }
  return status;
}
/**
 * 验证传递的name参数的值是否为正确
 * @param {*} item  案例：{ name: "username", val: "zto" }
 */
function validRule(item) {
  let name;
  if (_req.method === "GET") {
    name = _req.params[item.name] || _req.query[item.name];
  } else if (_req.method === "POST") {
    name = _req.body[item.name];
  }
  if (item.val) {
    return name == item.val
  }
  return true;

}

module.exports = loadJson;