// Generated by CoffeeScript 1.8.0
var ReportFactory, fCI, fP, fV, getCorrelationReportingText, getPostHocReportingText, getRegressionReportingText, getReportingText, getSignificanceTest2WayReportingText, getSignificanceTest3WayReportingText, getSignificanceTestReportingText, getSimpleMainEffectReportingText, prettyStringJoin, setReportingText, statDesc, statES, statNHST;

getReportingText = function(formula) {
  return reportingTextsArray[formula];
};

setReportingText = function(formula) {
  var resultsFromANOVA, variableList;
  switch (multiVariateTestResults["test-type"]) {
    case "unpairedTTest":
    case "pairedTTest":
    case "WelchTTest":
    case "MannWhitneyTest":
    case "oneWayANOVA":
    case "WelchANOVA":
    case "KruskalWallisTest":
    case "oneWayRepeatedMeasuresANOVA":
    case "FriedmanTest":
      if (multiVariateTestResults["simpleMainEffect"] != null) {
        reportingTextsArray[formula] = getSimpleMainEffectReportingText();
      } else {
        reportingTextsArray[formula] = getSignificanceTestReportingText();
      }
      break;
    case "factorialANOVA":
      variableList = sort(selectedVariables);
      if (variableList["independent"].length === 2) {
        reportingTextsArray[formula] = getSignificanceTest2WayReportingText();
      } else {
        reportingTextsArray[formula] = getSignificanceTest3WayReportingText();
      }
      break;
    case "pairwisePairedTTest":
    case "pairwisePairedWelchTTest":
    case "pairwisePairedWilcoxTest":
    case "pairwiseUnpairedWilcoxTest":
    case "tukeyHSDTest":
      reportingTextsArray[formula] = resultsFromANOVA + "\n" + getPostHocReportingText();
      resultsFromANOVA = "";
      break;
    case "pC":
    case "kC":
    case "bC":
      reportingTextsArray[formula] = getCorrelationReportingText();
      break;
    case "linR":
    case "mulR":
      reportingTextsArray[formula] = getRegressionReportingText();
      break;
    default:
      console.log("Error: No Method selected");
  }
};

prettyStringJoin = function(stringArray, delimiter, lastDelimiter) {
  var lastChunk;
  if (delimiter == null) {
    delimiter = ",";
  }
  if (lastDelimiter == null) {
    lastDelimiter = "and";
  }
  lastChunk = stringArray.pop();
  return "" + (stringArray.join(delimiter + " ")) + (stringArray.length > 1 ? delimiter : "") + " " + lastDelimiter + " " + lastChunk;
};

fV = function(varName) {
  return "<i>" + varName + "</i>";
};

fCI = function(lower, upper) {
  return "95% CI [" + (lower.toFixed(2)) + "," + (upper.toFixed(2)) + "]";
};

fP = function(p, format, includeLabel) {
  var formattedP, label, signAndValue;
  if (format == null) {
    format = "html";
  }
  if (includeLabel == null) {
    includeLabel = true;
  }
  p = Number(p);
  label = "";
  formattedP = (function() {
    switch (format) {
      case "html":
        return "<i>p</i> ";
      case "svg":
        return "<tspan font-style='italic'>p</tspan>";
      default:
        return "p ";
    }
  })();
  if (includeLabel) {
    label = formattedP + (p >= 0.001 ? "= " : "");
  }
  signAndValue = p < 0.001 ? "< .001" : omitZeroPValueNotation(p);
  return "" + label + signAndValue;
};

statDesc = function(dependentVariable, IVlevel, variableList) {
  var bla, centStat, centValue, ci, distribution, n, sd, val;
  distribution = variables[variableList["dependent"]][IVlevel];
  bla = [
    (function() {
      var _i, _len, _ref, _results;
      _ref = findCI(distribution);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        val = _ref[_i];
        _results.push(val.toFixed(2));
      }
      return _results;
    })()
  ];
  ci = findCI(distribution);
  sd = getStandardDeviation(distribution).toFixed(2);
  centStat = variableTypes[dependentVariable] === "ordinal" ? "<i>Mdn</i>" : "<i>M</i>";
  centValue = (variableTypes[dependentVariable] === "ordinal" ? median(distribution) : mean(distribution)).toFixed(2);
  n = distribution.length;
  return "" + (fV(IVlevel)) + " (" + centStat + " = " + centValue + ", " + (fCI(ci[0], ci[1])) + ", <i>SD</i> = " + sd + ", <i>n</i> = " + n + ")";
};

statES = function(p, effectSize) {
  var ESDesc, effectSizeAmount, effectSizeRounded, effectSizeType;
  effectSizeRounded = effectSize.toFixed(2);
  effectSizeAmount = getEffectSizeAmount(multiVariateTestResults["effect-size-type"], effectSize);
  effectSizeType = multiVariateTestResults["effect-size-type"];
  effectSizeType = (function() {
    switch (effectSizeType) {
      case "ηS":
        return "η" + String.fromCharCode(178);
      case "RS":
        return "r" + String.fromCharCode(178);
      default:
        return effectSizeType;
    }
  })();
  if (p >= 0.05 && effectSizeAmount < 2) {
    return "";
  }
  ESDesc = (function() {
    switch (effectSizeAmount) {
      case 0:
        return "However, there was nearly no effect, ";
      case 1:
        return "However, the effect size was small, ";
      case 2:
        return (p < 0.05 ? "The" : "However, the") + " differences constituted a medium effect size, ";
      case 3:
        return (p < 0.05 ? "The" : "However, the") + " differences constituted a large effect size, ";
    }
  })();
  return " " + ESDesc + " (" + (fV(effectSizeType)) + " = " + effectSizeRounded + "). ";
};

statNHST = function(parameterType, df, parameter, p) {
  var dfText;
  if (parameterType === "cS") {
    parameterType = String.fromCharCode(967) + String.fromCharCode(178);
  }
  dfText = hasDF[parameterType] ? "(" + df + ") " : "";
  return ", " + (fV(parameterType)) + dfText + " = " + (Number(parameter).toFixed(2)) + ", " + (fP(p)) + ".";
};

ReportFactory = (function() {
  function ReportFactory(varDict, resultDict, dv) {
    this.varDict = varDict;
    this.resultDict = resultDict;
    this.dv = dv;
  }

  ReportFactory.prototype.descText = function(i) {
    var descTextChunks, j;
    descTextChunks = (function() {
      var _i, _ref, _results;
      _results = [];
      for (j = _i = 0, _ref = this.varDict["independent-levels"][i].length; 0 <= _ref ? _i < _ref : _i > _ref; j = 0 <= _ref ? ++_i : --_i) {
        _results.push(statDesc(this.varDict["dependent"], this.varDict["independent-levels"][i][j], this.varDict));
      }
      return _results;
    }).call(this);
    return prettyStringJoin(descTextChunks, ",", "and");
  };

  ReportFactory.prototype.nhstAndES = function(i) {
    return statNHST(this.resultDict["parameter-type"], this.resultDict["df"][i], this.resultDict["parameter"][i], this.p(i)) + statES(this.p(i), this.resultDict["effect-size"][i]);
  };

  ReportFactory.prototype.p = function(i) {
    return getPurePValue(this.resultDict["p"][i]);
  };

  ReportFactory.prototype.mainFX = function(i, simple) {
    if (simple == null) {
      simple = false;
    }
    if (i % 2 === 0) {
      return "" + (simple ? "As for simple main effect, t" : "T") + "here was " + (this.p(i) < 0.05 ? "a" : "no") + " significant difference in " + this.dv + " between " + (this.descText(i));
    } else {
      return "Comparing " + (this.descText(i)) + ", a " + (this.p(i) >= 0.05 ? "non-" : "") + "significant " + (simple ? "simple " : "") + "main effect on " + this.dv + " was determined";
    }
  };

  ReportFactory.prototype.iFX2Way = function(iv1, iv2, i) {
    return "The interaction effect between " + iv1 + " and " + iv2 + " was " + (this.p(i) >= 0.05 ? "not " : void 0) + "significant";
  };

  return ReportFactory;

})();

getSignificanceTestReportingText = function(isSimpleMainEffect) {
  var ESText, NHSTText, article, dv, highestMeanIdx, highestMeanText, i, introText, iv, otherMeansText, p, variableList, _ref;
  if (isSimpleMainEffect == null) {
    isSimpleMainEffect = false;
  }
  variableList = getSelectedVariables();
  _ref = [fV(variableList["independent"]), fV(variableList["dependent"])], iv = _ref[0], dv = _ref[1];
  p = getPurePValue(multiVariateTestResults["p"]);
  article = titleCaps(AvsAn.query(multiVariateTestResults["method"])["article"]);
  highestMeanIdx = getHighestMean();
  highestMeanText = statDesc(variableList["dependent"], variableList["independent-levels"][highestMeanIdx], variableList);
  otherMeansText = prettyStringJoin((function() {
    var _i, _ref1, _results;
    _results = [];
    for (i = _i = 0, _ref1 = variableList["independent-levels"].length; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
      if (i !== highestMeanIdx) {
        _results.push(statDesc(variableList["dependent"], variableList["independent-levels"][i], variableList));
      }
    }
    return _results;
  })(), ",", "and for");
  NHSTText = statNHST(multiVariateTestResults["parameter-type"], multiVariateTestResults["df"], multiVariateTestResults["parameter"], p);
  ESText = statES(p, multiVariateTestResults["effect-size"][0]);
  introText = isSimpleMainEffect ? "" : ("<p>" + article + " " + multiVariateTestResults["method"] + " was conducted to investigate the effect of ") + ("" + iv + " on " + dv + ".</p>");
  return introText + (isSimpleMainEffect ? "" : "<p>") + ("The results indicated a higher " + dv + " for " + highestMeanText + " than for " + otherMeansText + ".") + (isSimpleMainEffect ? " " : "</p><p>") + (p <= 0.05 ? "A significant difference could be reported" : "This difference was not significant") + NHSTText + ESText + (isSimpleMainEffect ? "" : "</p>");
};

getSimpleMainEffectReportingText = function() {
  var anIV, dv, fixLevelText, fixedIVDicts, fxInfo, testedIV, _ref;
  fxInfo = multiVariateTestResults["simpleMainEffect"];
  _ref = [fV(fxInfo["testedIV"]), fV(fxInfo["dependent"])], testedIV = _ref[0], dv = _ref[1];
  fixedIVDicts = fxInfo["fixedIVs"];
  fixLevelText = prettyStringJoin((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = fixedIVDicts.length; _i < _len; _i++) {
      anIV = fixedIVDicts[_i];
      _results.push("" + (fV(anIV["name"])) + " = " + anIV["level"]);
    }
    return _results;
  })(), ",", "and");
  return ("<p>For " + fixLevelText + ", the simple main effect of " + testedIV + " on " + dv + " follows: ") + getSignificanceTestReportingText(true) + "</p>";
};

getSignificanceTest2WayReportingText = function() {
  var dv, i, idxIFX, iv1, iv2, rFactory, variableList, _ref;
  variableList = sort(selectedVariables);
  _ref = [fV(variableList["independent"][0]), fV(variableList["independent"][1])], iv1 = _ref[0], iv2 = _ref[1];
  dv = fV(variableList["dependent"]);
  rFactory = new ReportFactory(variableList, multiVariateTestResults, dv);
  idxIFX = variableList["independent"].length;
  return ("<p>To compare the effect of " + iv1 + " and " + iv2 + " as well as their interaction ") + (" on " + dv + ", a " + multiVariateTestResults["method"] + " was conducted.</p>") + "<p>" + rFactory.iFX2Way(iv1, iv2, idxIFX) + rFactory.nhstAndES(idxIFX) + "</p>" + "<p>" + ((function() {
    var _i, _ref1, _results;
    _results = [];
    for (i = _i = 0, _ref1 = variableList["independent"].length; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
      _results.push(rFactory.mainFX(i) + rFactory.nhstAndES(i));
    }
    return _results;
  })()).join("</p><p>") + "</p>";
};

getSignificanceTest3WayReportingText = function() {
  var aVar, dv, expandEffectText, i, iFXVars, idx1Way, idx2Way, idx3Way, ivs, ns2WayIdx, rFactory, sig2WayIdx, variableList, _ref;
  _ref = [[0, 1, 2], [3, 4, 5], 6], idx1Way = _ref[0], idx2Way = _ref[1], idx3Way = _ref[2];
  variableList = sort(selectedVariables);
  ivs = (function() {
    var _i, _len, _ref1, _results;
    _ref1 = variableList["independent"];
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      aVar = _ref1[_i];
      _results.push(fV(aVar));
    }
    return _results;
  })();
  dv = fV(variableList["dependent"]);
  rFactory = new ReportFactory(variableList, multiVariateTestResults, dv);
  sig2WayIdx = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = idx2Way.length; _i < _len; _i++) {
      i = idx2Way[_i];
      if (rFactory.p(i) < 0.05) {
        _results.push(i);
      }
    }
    return _results;
  })();
  ns2WayIdx = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = idx2Way.length; _i < _len; _i++) {
      i = idx2Way[_i];
      if (rFactory.p(i) >= 0.05) {
        _results.push(i);
      }
    }
    return _results;
  })();
  iFXVars = function(i) {
    return fV(multiVariateTestResults["labels"][i].split(":")[0]) + (" " + (String.fromCharCode(215)) + " ") + fV(multiVariateTestResults["labels"][i].split(":")[1]);
  };
  expandEffectText = function(idxs, isSignificant) {
    var preamble;
    if (idxs.length === 0) {
      return "";
    }
    return preamble = "<p>" + (isSignificant ? "The significant two-way interactions were " : "The following two-way interactions were not significant: ") + prettyStringJoin((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = idxs.length; _i < _len; _i++) {
        i = idxs[_i];
        _results.push(("" + (iFXVars(i))) + rFactory.nhstAndES(i));
      }
      return _results;
    })(), ",", "and") + "</p>";
  };
  return ("<p>" + multiVariateTestResults["method"] + " was conducted to compare the effect of ") + prettyStringJoin(ivs, ",", "and") + " as well as their interactions " + (" on " + dv + ".") + (" The three-way interaction was " + (rFactory.p(idx3Way) >= 0.05 ? "not " : void 0) + "significant") + rFactory.nhstAndES(idx3Way) + "</p>" + expandEffectText(sig2WayIdx, true) + expandEffectText(ns2WayIdx, false) + "" + ((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = idx1Way.length; _i < _len; _i++) {
      i = idx1Way[_i];
      _results.push(rFactory.mainFX(i, true) + rFactory.nhstAndES(i));
    }
    return _results;
  })()).join("<br/>");
};

getPostHocReportingText = function() {
  var idx, iv, pairDiffStat, pairLv;
  iv = fV(getSelectedVariables()["independent"][0]);
  getPurePValue(multiVariateTestResults["p"]);
  pairDiffStat = function(idx) {
    var ciText, p, pairDiff, sigText;
    pairDiff = postHocTestResults["differences"][idx];
    ciText = fCI(postHocTestResults["lowerCI"][idx], postHocTestResults["upperCI"][idx]);
    p = postHocTestResults["rawP"][idx];
    p = p === 0 ? "0.0001" : p + "";
    sigText = (p < 0.05 ? "" : "not ") + "significant";
    return "" + pairDiff + " (" + ciText + ", " + (fP(p)) + "; " + sigText + ")";
  };
  pairLv = function(i, j) {
    return fV(postHocTestResults["pairs"][i][j]);
  };
  return ("<p>Post-hoc " + postHocTestResults["method"] + " was conducted to further investigate the effect of " + iv + ". ") + "The difference between " + prettyStringJoin((function() {
    var _i, _ref, _results;
    _results = [];
    for (idx = _i = 0, _ref = postHocTestResults["pairs"].length; 0 <= _ref ? _i < _ref : _i > _ref; idx = 0 <= _ref ? ++_i : --_i) {
      _results.push("" + (pairLv(idx, 0)) + " and " + (pairLv(idx, 1)) + " was " + (pairDiffStat(idx)));
    }
    return _results;
  })(), ",", "and") + ".</p>";
};

getCorrelationReportingText = function() {
  var text;
  text = "";
  return text;
};

getRegressionReportingText = function() {
  var text;
  text = "";
  return text;
};

//# sourceMappingURL=report.js.map