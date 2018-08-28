/// <reference path="../../kachjs/component.ts"/>
@Component('cv-name')
class CvnameComponent extends KachComponent {
  constructor() {
    super('cv-name');
    if (!this.innerData || !/^[A-Z][a-z]* [A-Z][a-z]*$/.test(this.innerData))
      console.error('Wrong name:', this.innerData);
    else $data['initials'] = this.innerData[0] + this.innerData[this.innerData.indexOf(' ') + 1];
  }
}
