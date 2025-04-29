const namespaceURI = "http://www.w3.org/2000/svg";

const SvgAnimate = (): SVGAnimateElement => {
  const animate = document.createElementNS(namespaceURI, "animate");
  animate.setAttribute("attributeName", "opacity");
  animate.setAttribute("from", "0");
  animate.setAttribute("to", "1");
  animate.setAttribute("dur", "2s");
  animate.setAttribute("begin", "null");
  animate.setAttribute("repeatCount", "1");
  animate.setAttribute("fill", "freeze");
  return animate;
};

const SvgImage = (href: string): SVGImageElement => {
  const image = document.createElementNS(namespaceURI, "image");
  image.setAttribute("href", href);
  image.setAttribute("x", "-4%");
  image.setAttribute("y", "-4%");
  image.setAttribute("height", "108%");
  image.setAttribute("width", "108%");
  image.setAttribute("preserveAspectRatio", "xMidYMid slice");
  image.style.filter = "url(#svg_blurfilter)";
  return image;
};

export { SvgAnimate, SvgImage };
