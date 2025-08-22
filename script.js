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
			obj.traverse(node => {
				// skip if no name
				if (!node.name) return;
				// correct indexOf usage: look for substring 'ship'
				if (node.name.indexOf('ship') !== -1) {
					// ensure material exists; handle material arrays
					if (!node.material) return;
					const materials = Array.isArray(node.material) ? node.material : [node.material];
					materials.forEach(mat => {
						if (!mat) return;
						if (mat.color && typeof mat.color.set === 'function') {
							// prefer THREE.Color if available
							if (window.THREE && window.THREE.Color) {
								mat.color.set(new window.THREE.Color('green'));
							} else {
								mat.color.set('green');
							}
						}
					});
				}
			});
		});
	}
});

// water-jet component: clicking triggers extinguish behavior
AFRAME.registerComponent('water-jet', {
	init: function () {
		const el = this.el;
		el.classList.add('clickable');

		el.addEventListener('click', () => {
			// find the fire entity
			const fire = document.querySelector('#campfire');
			const sfx = document.querySelector('#sfxExtinguish');
			const popup = document.querySelector('#popup');

			if (fire) {
				// remove particle systems (extinguish)
				const ps = fire.querySelector('[particle-system]');
				if (ps) {
					ps.parentNode.removeChild(ps);
				}
			}

			// play sound effect if available
			if (sfx && sfx.components && sfx.components.sound) {
				sfx.components.sound.playSound();
			}

			// show educational popup
			if (popup) {
				popup.setAttribute('visible', true);
			}
		});
	}
});

// close popup on click
document.addEventListener('click', function (evt) {
	const popup = document.querySelector('#popup');
	if (!popup) return;
	// if the popup is visible and click is outside of it, hide it
	if (popup.getAttribute('visible')) {
		// hide on any click for simplicity
		popup.setAttribute('visible', false);
	}
});


