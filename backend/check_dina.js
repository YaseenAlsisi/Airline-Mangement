const http = require("http");
function login(user, pass) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({username: user, password: pass});
    const req = http.request({host:"localhost", port:8081, path:"/api/v1/auth/login", method:"POST", headers:{"Content-Type":"application/json"}}, res => {
      let d=""; res.on("data",c=>d+=c); res.on("end",()=>resolve({status:res.statusCode, body:JSON.parse(d)}));
    });
    req.on("error",reject); req.write(body); req.end();
  });
}
async function test() {
  for (const u of ["admin","Mostafa","Developers","eyad"]) {
    const r = await login(u,"admin");
    if (r.status===200) console.log(u, "=> LOGIN OK");
    else console.log(u, "=> FAIL", r.status, JSON.stringify(r.body));
  }
}
test().catch(console.error);
