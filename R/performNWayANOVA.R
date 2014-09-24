performNWayANOVA <- function (dataset, dependentVariable, independentVariables) 
{
  dataset = as.data.frame(dataset);
  
  factorString = toFormulaString(getCombinations(independentVariables)); # the magic function(s)		
  
  formula = paste(dependentVariable, " ~ ", factorString, sep=""); # append factorString to create formula	
  formula = as.formula(formula)
  
  # get model
  model = lm(formula, data = dataset);
  
  # perform type III ANOVA
  result = car::Anova(model, type="III", singular.ok = T);  
  eSquared = lsr::etaSquared(model, type=3);
  
  labels = names(eSquared[,1])

  list(p = result[["Pr(>F)"]][2:(length(labels)+1)], F = result[["F value"]][2:(length(labels)+1)], numDF = result[["Df"]][2:(length(labels)+1)], denomDF = result[["Df"]][length(result[["Df"]])], etaSquared = eSquared[,1], labels = labels);
}
