/**
 * Module dependencies.
 */
 
var express = require('express')
  , routes = require('./routes')
  , http = require('http');
 
var app = express();
var server = app.listen(process.env.VMC_APP_PORT || 1337, null);
var io = require('socket.io').listen(server);

if(process.env.VCAP_SERVICES){
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
}
else{
    var mongo = {
        "hostname":"localhost",
        "port":27017,
        "username":"",
        "password":"",
        "name":"",
        "db":"db"
    }
}
var generate_mongo_url = function(obj){
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'test');
    if(obj.username && obj.password){
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
    else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
}
var mongourl = generate_mongo_url(mongo);


var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;
mongoose.connect(mongourl);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


  var partSchema = new Schema({
    name: String,
    system: String,
    CADer: String,
    Drafter: String,
    CAMer: String,
    state: String,
    part_number: String, 
    quantity: Number, 
    drawing: String, 
    drawing_revision: Number,
    drawing_approval: Boolean, 
    cam: String,
    cam_revision: Number,
    cam_approval: Boolean,
    cad: String,
    cad_revision: Number,
    cad_approval: Boolean,
    stock_material: String,
    stock: Boolean,
    machinist: String, 
    finished: Boolean,
    quality_assurance: Boolean
  });
  var part = mongoose.model('part', partSchema);

  var peopleSchema = new Schema({
    name: String, 
    pass: String, 
    parts: [{ type: Schema.Types.ObjectId, ref: 'part' }],
    tasks: Array,
    role: String
  });

  var people = mongoose.model('people', peopleSchema);

app.configure(function(){
  io.set('transports', ['xhr-polling']);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.session({secret: 'supersecretkeygoeshere'}));
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});
 
app.configure('development', function(){
  app.use(express.errorHandler());
});
 
app.get('/', function(req, res){
  if(req.session.user){
    people.find({}, null, {sort: {name: 1}}).populate('parts').exec(function(err, persons){
      if (err) return handleError(err);
      console.log(persons);
      part.find({}, null, {sort: {name: 1}}, function(err, things){
        if(req.session.user=="overview"){
          res.render('overview_alone', { user: req.session.user, people:persons, parts:things });
        }else if(req.session.user){
          res.render('in', { user: req.session.user, people:persons, parts:things });
        }
      });
    });
  }else{
    res.render('index', { title: 'Express' });
  }
});
 
app.get('/logout', function(req, res){
  req.session.destroy();
  res.redirect('/');
});

app.get('/chat', function(req, res){
  res.end();
  var user = req.session.user; 
  var msg = req.query.msg;
  io.sockets.emit('chat', user, msg);
});

app.get('/checkPerson', function(req, res){
  if(req.query.name=="overview"){
    res.end('t');
  }
    people.findOne({ 'name': req.query.name }, function (err, person) {
      if (err) return handleError(err);
      if(person!=null){
        console.log(person.name);
        res.end('t');
      }else{
        console.log('none');
        res.end('f');
      }
    });
}); 

app.get('/checkPass', function(req, res){
  if(req.query.name=='overview'){
    people.findOne({'pass':req.query.pass}, function(err, person){
      if (err) return handleError(err);
      if(person!=null){
        req.session.user = "overview";
        res.end('t');
      }else{
        res.end('f');
      }
    });
  }else{
    people.findOne({ 'name': req.query.name, 'pass':req.query.pass }, function (err, person) {
      if (err) return handleError(err);
      if(person!=null){
        console.log(person.name);
        req.session.user = person.name; 
        console.log(req.session.user);
        res.end('t');
      }else{
        console.log('none');
        res.end('f');
      }
    });
  }
}); 

app.get('/add', function(req, res){
  var type_of = req.query.of;
  var num = 0; 
  if(type_of=="parts"){
    part.find({},function(err,parts){
      num = parts.length;
    });
    num++;
    var p = new part();
    p.name = "NEW PART";

    p.state = "QUEUED";
    p.save(function(err, part){
      if(!err){
        new_add(type_of, part.id, part.name);
        res.end();
      }
    });
  }
});

var new_add = function(of, id, name){
  io.sockets.emit('add', of, id, name);
}
  
app.get('/update', function(req, res){
  var type_of = req.query.of;
  var id = req.query.id; 
  var field = req.query.property;
  var newval = req.query.value; 
  if(type_of=='people'){
    people.findById(id, function(err, p){
      if (err||!p){
        return handleError(err);
        res.end('f');
      }else{
        p[field] = newval;
        p.save(function(err){
          if(err){
            console.log(err);
          }else{
            console.log('success');
            if(field!="pass"){
              update(type_of, id, field, newval);
            }
          }
        });
      }
    });
  }else if(type_of=="parts"){
    part.findById(id, function(err, p){
      if (err||!p){
        res.end('f');
      }else{
        if(Object.prototype.toString.call(p[field]) === '[object Array]'){
          p[field] = newval;
          p.save(function(err){
            if(err){
              console.log(err);
            }else{
              console.log('success');
              update(type_of, id, field, newval);
            }
          });          
        }else{
          if(field=='name'&&newval==''){
            p.remove();
            old_remove(type_of, id);
          }else{
            if(field=='CADer'||field=='Drafter'||field=='CAMer'||field=='machinist'){
              if(p[field]&&p[field]!=newval){
                people.findOne({name:p[field]}, function(err, person){
                  if(!err&&person){
                    person.parts.splice(person.parts.indexOf(p.id), 1); 
                    var q = p; 
                    q.name = "";
                    update("people", person.id, "parts", q);
                    person.save();
                  }
                });
              }
              people.findOne({name:newval}, function(err, person){
                if(!err&&person){
                  if(person.parts.indexOf(p.id)==-1){
                    person.parts.push(p.id);
                    update("people", person.id, "parts", p);
                    person.save();
                  }
                }
              });
            }
            // if(field!="name"){
            //   p[field] = newval.toUpperCase();
            // }else{
              p[field] = newval;
            // }
            people.find({parts:{$in:[p.id]}}, function(err, person){
              if(!err){
                for(var i=0; i<person.length; i++){
                  update("people", person[i].id, "parts", p);
                }
              }
            });
            p.save(function(err){
              if(err){
                console.log(err);
              }else{
                console.log('success');
                update(type_of, id, field, newval);
              }
            });
          }
        }

      }
    });  
  }
  res.end('t');
});

var update = function(of, id, property, value){
  io.sockets.emit('update', of, id, property, value);
}

var old_remove = function(of, id){
  io.sockets.emit('remove', of, id);
}

app.get('/addAllMembers', function(req, res){
  var team = ['justin', 'jyrrl', 'obaid', 'david', 'austin', 'aaron', 'liani', 'scott', 'arturo', 'tommy', 'michael', 'eric', 'stephanie', 'josh', 'tunde','misbah'];
  var pass = ['justin!g', 'jyrrl!kf', 'obaid!m', 'david!d', 'austin!d', 'aaron!r', 'liani!l', 'scott!n', 'arturo!m', 'tommy!a', 'michael!d', 'eric!j', 'stephanie!l', 'josh!b', 'tunde!a','misbah!k'];
  for(var i=0;i<team.length;i++){
      new people({
        name:team[i],
        pass:pass[i]
      }).save( function( err, todo, count ){
        
      });
      console.log(team[i]);
  }
  res.end();
});
 
console.log("Express server listening on port 3000");

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
