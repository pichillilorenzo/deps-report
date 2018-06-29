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
  circular: boolean,
  onlyCircular: boolean,
  onlyNotFound: boolean,
  hideNotFound: boolean,
  parent: DepsReportCommandOptions
}

type FindDependentsCommandOptions = {
  root: string, 
  circular: boolean,
  onlyCircular: boolean,
  onlyNotFound: boolean,
  hideNotFound: boolean,
  parent: DepsReportCommandOptions
}