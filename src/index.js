import './styles/main.scss';

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
	addAnimation();
}

function addAnimation() {
	const scrollers = document.querySelectorAll('.scroller');

	scrollers.forEach(scroller => {
		const scrollerInner = scroller.querySelector('.scroller__inner');
		const scrollerContent = Array.from(scrollerInner.children);

		scrollerContent.forEach(item => {
			const duplicatedItem = item.cloneNode(true);
			duplicatedItem.setAttribute('aria-hidden', true);
			scrollerInner.appendChild(duplicatedItem);
		});
	});
}

const sliderInner1 = document.getElementById('slides-stage');
const prev1 = document.getElementById('prev-stages');
const next1 = document.getElementById('next-stages');
const stagesBlock = document.querySelector('.stages__pagination');
const pageCollection = stagesBlock.getElementsByClassName('pagination__symbol');
const slideAmount = 5;
const slideWidth1 = 335;
const slideGap1 = 20;

let currentSlide1 = 1;

prev1.addEventListener('click', function () {
	shiftSlide('prev');
});
next1.addEventListener('click', function () {
	shiftSlide('next');
});

function shiftSlide(direction) {
	let currentPos1 = 0;
	if (direction === 'prev') {
		currentSlide1 -= 1;
		changePagePrev(currentSlide1);
		if (currentSlide1 == slideAmount - 1) {
			toggleClass(next1, 'disabled');
		}
		if (currentSlide1 == 1) {
			toggleClass(prev1, 'disabled');
		}
	} else {
		currentSlide1 += 1;
		changePageNext(currentSlide1);
		if (currentSlide1 == 2) {
			toggleClass(prev1, 'disabled');
		}
		if (currentSlide1 == slideAmount) {
			toggleClass(next1, 'disabled');
		}
	}
	currentPos1 = -(slideWidth1 + slideGap1) * (currentSlide1 - 1);
	sliderInner1.style.left = `${currentPos1}px`;
}

function toggleClass(node, className) {
	node.classList.toggle(className);
}

function changePageNext(number) {
	pageCollection[number - 1].classList.toggle('active');
	if (number > 1) {
		pageCollection[number - 2].classList.toggle('active');
	}
}

function changePagePrev(number) {
	pageCollection[number - 1].classList.toggle('active');
	if (number < slideAmount) {
		pageCollection[number].classList.toggle('active');
	}
}

const slider2 = document.getElementById('slider-participants');
const sliderInner2 = document.getElementById('slides-participants');
const prev2 = document.getElementById('prev-participants');
const next2 = document.getElementById('next-participants');
const cardsPerSlideNode = document.getElementById('cards-amount');

let sliderDisable = sliderInit(
	slider2,
	sliderInner2,
	prev2,
	next2,
	cardsPerSlideNode
);

function sliderInit(slider, sliderInner, prev, next, pagination) {
	let posInitial;
	const cardGap = 20;
	const cards = sliderInner.getElementsByClassName('card');
	const cardsArray = Array.from(cards);
	const cardsLength = cardsArray.length;
	let index = 0;
	let allowShift = true;
	const cardSize = cardsArray[0].offsetWidth;
	const sliderWidth = slider.offsetWidth;
	const cardsPerSlide = Math.round(sliderWidth / (cardSize + cardGap));
	const firstSlide = cardsArray.slice(0, cardsPerSlide);
	const lastSlide = cardsArray.slice(-cardsPerSlide);
	const cloneFirst = firstSlide.map(item => item.cloneNode(true));
	const cloneLast = lastSlide.map(item => item.cloneNode(true));
	const controller = new AbortController();
	const { signal } = controller;

	function appendNodes(nodesArray, parentNode, place, referenceNode) {
		nodesArray.forEach(item => item.setAttribute('aria-hidden', true));
		if (place === 'before') {
			nodesArray.forEach(item => parentNode.insertBefore(item, referenceNode));
		} else if (place === 'after') {
			nodesArray.forEach(item => parentNode.insertBefore(item, null));
		}
	}

	appendNodes(cloneFirst, sliderInner, 'after');
	appendNodes(cloneLast, sliderInner, 'before', cardsArray[0]);
	pagination.innerText = getPage();

	prev.addEventListener(
		'click',
		function () {
			shiftSlide(-1);
		},
		{ signal }
	);
	next.addEventListener(
		'click',
		function () {
			shiftSlide(1);
		},
		{ signal }
	);
	let intervalId = setInterval(shiftSlide, 4000, 1);
	sliderInner.addEventListener('transitionend', checkIndex, { signal });

	function shiftSlide(direction) {
		console.log('done');
		sliderInner.classList.add('shifting');
		posInitial = sliderInner.offsetLeft;

		if (allowShift) {
			if (direction === 1) {
				sliderInner.style.left = `${
					posInitial - (cardSize + cardGap) * cardsPerSlide
				}px`;
				index++;
			} else if (direction === -1) {
				sliderInner.style.left = `${
					posInitial + (cardSize + cardGap) * cardsPerSlide
				}px`;
				index--;
			}
			pagination.innerText = getPage();
		}
		allowShift = false;
	}

	function checkIndex() {
		sliderInner.classList.remove('shifting');

		if (index === -1) {
			sliderInner.style.left = `${-(cardsLength * (cardSize + cardGap))}px`;
			index = cardsLength / cardsPerSlide - 1;
		}
		if (index === cardsLength / cardsPerSlide) {
			sliderInner.style.left = `${-(cardSize + cardGap) * cardsPerSlide}px`;
			index = 0;
		}
		allowShift = true;
	}

	function getPage() {
		let page;
		if (index == -1) {
			page = cardsLength;
		} else if (index == cardsLength / cardsPerSlide) {
			page = cardsPerSlide;
		} else page = (index + 1) * cardsPerSlide;
		return page;
	}

	function removeNodes() {
		const cardsToDelete = sliderInner.querySelectorAll('[aria-hidden="true"]');
		if (cardsToDelete) {
			Array.from(cardsToDelete).forEach(item => sliderInner.removeChild(item));
		}
	}

	return function sliderUnmount() {
		controller.abort();
		clearInterval(intervalId);
		removeNodes();
		sliderInner.style.left = '';
	};
}

window.addEventListener('resize', resizeSlider);

function resizeSlider() {
	sliderDisable();
	sliderDisable = sliderInit(
		slider2,
		sliderInner2,
		prev2,
		next2,
		cardsPerSlideNode
	);
}
