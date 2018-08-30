/// <reference path="../../kachjs/component.ts"/>
@Component('cv-link')
class CvLinkComponent extends KachComponent {
  constructor() {
    super('cv-link');
  }
}
function parseLink(link: string) {
  // Omit protocol name with colon: https, tel
  link = link.slice(link.indexOf(':') + 1);
  // Omit two slashes, if present: [https:]//example.com
  if (link.startsWith('//')) link = link.slice(2);
  return link;
}
