// @flow
 
type DepsReportCommandOptions = {
  excludeNodeModules: boolean, 
  json: boolean, 
  pretty: boolean, 
  absPath: boolean, 
  webpackConfig: string, 
  specifiers: boolean,
  color: boolean
}

type FindDependenciesCommandOptions = {
  parent: DepsReportCommandOptions
}

type FindDependentsCommandOptions = {
  root: string, 
  parent: DepsReportCommandOptions
}