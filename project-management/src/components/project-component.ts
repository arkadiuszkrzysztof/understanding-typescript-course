export abstract class ProjectComponent {
  templateElement: HTMLTemplateElement
  appElement: HTMLElement

  constructor (templateId: string, appElementId: string) {
    this.templateElement = document.getElementById(templateId) as HTMLTemplateElement
    this.appElement = document.getElementById(appElementId) as HTMLDivElement
  }

  protected attachElemetToApp (insertAtStart: boolean, elementToAttach: HTMLElement): void {
    this.appElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', elementToAttach)
  }
}
