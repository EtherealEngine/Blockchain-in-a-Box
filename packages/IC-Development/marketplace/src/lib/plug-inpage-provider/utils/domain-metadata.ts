const getDomainMetadata = () => {
  const url = beautifyUrl(window.location.origin);
  const name = getName();
  const icons = getIcons();
  const pageWidth = getPageWidth();

  return {
    url,
    name,
    icons,
    pageWidth,
  };
};

export default getDomainMetadata;

const beautifyUrl = (url: string) => (
  url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]
);

const getPageWidth = () => {
  const win = window,
    doc = document,
    docElem = doc.documentElement,
    body = doc.getElementsByTagName('body')[0];
  return win.innerWidth || docElem.clientWidth || body.clientWidth;
};

const getName = () => {

  let name: string | null = null;

  const metaTags = document.getElementsByTagName('meta');

  if (!metaTags) return beautifyUrl(window.location.origin);

  for (let i = 0; i < metaTags.length; i += 1) {

    const meta = metaTags[i];

    // @ts-ignore: Object is possibly 'null'.
    const property = meta.getAttribute('property')?.toLowerCase().indexOf('site_name') > -1;

    if (property) {
      name = meta.getAttribute('content');
    }
  }

  return name ?? beautifyUrl(window.location.origin);
};

const getIcons = () => {
  const links = document.getElementsByTagName('link');

  const icons: string[] = [];

  for (let i = 0; i < links.length; i += 1) {
    const link = links[i];

    // @ts-ignore: Object is possibly 'null'.
    const rel = link.getAttribute('rel')?.toLowerCase().indexOf('icon') > -1;

    if (rel) {
      const href = link.getAttribute('href');

      if (href) {
        if (
          href.toLowerCase().indexOf('https:') === -1
          && href.toLowerCase().indexOf('http:') === -1
          && href.indexOf('//') !== 0
        ) {
          let absoluteHref = `${window.location.protocol}//${window.location.host}`;

          if (href.indexOf('/') === 0) {
            absoluteHref += href;
          } else {
            const path = window.location.pathname.split('/');
            path.pop();
            const finalPath = path.join('/');

            absoluteHref += `${finalPath}/${href}`;
          }

          icons.push(absoluteHref);
        } else if (href.indexOf('//') === 0) {
          const absoluteUrl = window.location.protocol + href;

          icons.push(absoluteUrl);
        } else {
          icons.push(href);
        }
      }
    }
  }

  return icons;
};
