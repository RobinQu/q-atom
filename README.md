#Q-Atom

A extensible object system for both server end and client end. Part of [Project Q](http://elfvision.com/projects/Q). A universal application frameworks for enterprise JavaScript!

##Synopsis

###Base Object
We have a powerful base object, you can mix-in any properties.

		var foo = Q.Object.create({
			"bar": "foo.bar"
		});
	
###Extending
All class derive from *Q.Object*
	
		var Bar = Q.Object.extend({
			"props": "value"
		});

		var Foo = Bar.extend({
			"props": "value1",
			"nice": "day"
		});

###Creating
Using *#create* method or *new* keyword

		var bar = Bar.create();
		var foo = new Foo();

You can pass a hash to override its default properties.

		var foo1 = new Foo({
			"props": "value2"
		});

###Overridden Methods
You can access the overridden method by *arguments.callee.base*
	
		var SuperFoo = Foo.extend({
			foo: function() {}
		});
		var SuperFooBar = SuperFoo.extend({
			foo: function() {
				//call super!
				arguments.callee.base.apply(this, arguments);
				//my own logics
				//blabala
			}
		});


##TODO
Object designator using newly introduced API in Javascript 1.8.5:
	
	//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/defineProperty
	Object.defineProperty
	//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/defineProperties
	Object.defineProperties
	//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create
	Object.create
	

