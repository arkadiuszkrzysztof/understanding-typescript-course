import { ProjectInput } from './components/project-input'
import { ProjectList } from './components/project-list'
import { ProjectStatus } from './state/project-state'

const projectInput = new ProjectInput()

const activeProjectList = new ProjectList(ProjectStatus.Active)
const completedProjectList = new ProjectList(ProjectStatus.Completed)

console.log(projectInput, activeProjectList, completedProjectList)
