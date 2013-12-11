loadFile <- function(filePath)
{
    install.packages("lawstat")
    fileType = substr(filePath, nchar(filePath) - 3 + 1, nchar(filePath));
    
    if(fileType == "txt")
        dataset <- read.table(filePath, head=T);
    if(fileType == "csv")
        dataset <- read.csv(filePath, head=T);
    
    variableNames = names(dataset);
    
    list(dataset = dataset, variableNames = variableNames);
}
