AFRAME.registerComponent('log', {
	schema: {
		message:{type:'string',default:"Change the default message"}
	},

	init: function () {
	  // Do something when component first attached.
	  let msg = this.data.message;
	  console.log(msg);

	  // Attach the collide listener to the entity itself. This avoids
	  // querying the DOM before A-Frame has created the entity.
	  this.el.addEventListener('collide', function (evt) {
		console.log('collided', evt);
	  });
	},
});

AFRAME.registerComponent('change-color-on-hover', {
	schema: {
		color:{default:'#FF0000'}
	},

	init: function () {
		let el = this.el;
		let data = this.data;
		let defaultColor = el.getAttribute('material').color;

		el.addEventListener('mouseenter',function(env){
			el.setAttribute('color',data.color);
		})
		el.addEventListener('mouseleave',function(env){
			el.setAttribute('color',defaultColor);
		})
	},

	update: function () {
	  // Do something when component's data is updated.
	},

	remove: function () {
	  // Do something the component or its entity is detached.
	},

	tick: function (time, timeDelta) {
	  // Do something on every scene tick or frame.
	}
});


AFRAME.registerComponent('modify-materials',{
	init:function(){
		this.el.addEventListener('model-loaded',()=>{
			const obj = this.el.getObject3D('mesh');
			obj.traverse(node=>{
				if(node.name.indexOf('ship' !== -1)){
					node.material.color.set('green');
				}
			});
		});
	}
});