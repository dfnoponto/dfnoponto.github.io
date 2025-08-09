var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");

/**
 * @requires OpenLayers/Strategy.js
 * @requires OpenLayers/Layer/Vector.js
 */

OpenLayers.Strategy.CenteredCluster = OpenLayers.Class(OpenLayers.Strategy, {

    centered: true,

    enabled: true,

    zoomSettings: null,

    candidateMatches: null,

    distance: 20,

    threshold: null,

    features: null,

    clustering: false,

    resolution: null,

    defaultSettings: null,


    layerListeners: null,

    initialize: function(options) {
        OpenLayers.Strategy.prototype.initialize.apply(this, [options]);

        var _candidateMatches = null;

        var _resDistance2 = 0;

        var _withinDistance = function(x, y) {
            return (x * x + y * y) <= _resDistance2;
        };

        var _addFeature = function(cluster, feature, fCenter) {
            if (_withinDistance(cluster.x - fCenter.lon,
                               cluster.y - fCenter.lat)) {
                cluster.f.push(feature);
                cluster.sx += fCenter.lon;
                cluster.sy += fCenter.lat;
                return true;
            }
            return false;
        };

        var _centerCluster = function(cluster) {
            var len = cluster.f.length;
            cluster.x = cluster.sx / len;
            cluster.y = cluster.sy / len;
        };

        var _trimCluster = function(rejections, cluster) {
            var wasRejected = false,
                clusterArr = cluster.f;
            do {
                _centerCluster(cluster);
                var rejected = false;
                for (var ii = clusterArr.length - 1; ii >= 0; ii--) {
                    var feature = clusterArr[ii],
                        fCenter =
                                 feature.geometry.getBounds().getCenterLonLat();
                    if (!_withinDistance(cluster.x - fCenter.lon,
                                        cluster.y - fCenter.lat)) {
                        clusterArr.splice(ii, 1);
                        cluster.sx -= fCenter.lon;
                        cluster.sy -= fCenter.lat;
                        rejections.push(feature);
                        rejected = true;
                    }
                }
                wasRejected = wasRejected || rejected;
            } while (rejected);
            return wasRejected;
        };

        var _groupFeatures = function(clusters, features) {
            var feature, cluster, clustered, fCenter;
            for (var i = 0, len = features.length; i < len; i++) {
                feature = features[i];
                feature.renderIntent = 'default';
                if (feature.geometry) {
                    fCenter = feature.geometry.getBounds().getCenterLonLat();
                    clustered = false;
                    for (var ii = clusters.length - 1; ii >= 0; ii--) {
                        cluster = clusters[ii];
                        if (_candidateMatches(cluster.f, feature) &&
                            _addFeature(cluster, feature, fCenter)) {
                            clustered = true;
                            break;
                        }
                    }
                    if (!clustered) {
                        cluster = {
                            sx: fCenter.lon,
                            sy: fCenter.lat,
                            x: fCenter.lon,
                            y: fCenter.lat,
                            f: [feature]
                        };
                        clusters.push(cluster);
                    }
                }
            }
        };

        var _groupClusters = function(remainingStart, clusters, candidates) {
            var candidate, cluster, clustered, ii, feature, fCenter;
            for (var i = 0, len = candidates.length; i < len; i++) {
                candidate = candidates[i];
                // calculate the center of the cluster candidate.
                _centerCluster(candidate);
                clustered = false;
                for (ii = clusters.length - 1; ii >= remainingStart; ii--) {
                    cluster = clusters[ii];
                    if (_withinDistance(cluster.x - candidate.x,
                                       cluster.y - candidate.y) &&
                                 _candidateMatches(cluster.f, candidate.f[0])) {
                        Array.prototype.push.apply(cluster.f, candidate.f);
                        cluster.sx += candidate.sx;
                        cluster.sy += candidate.sy;
                        clustered = true; // But we will review again.
                        clusters.splice(ii, 1);
                        candidates[i] = cluster;
                        i--;
                        break;
                    }
                }
                if (!clustered) {
                    for (ii = remainingStart - 1; ii >= 0; ii--) {
                        cluster = clusters[ii];
                        if (_withinDistance(cluster.x - candidate.x,
                                           cluster.y - candidate.y) &&
                                 _candidateMatches(cluster.f, candidate.f[0])) {
                            var cc = candidate.f;
                            for (var iii = cc.length - 1; iii >= 0; iii--) {
                                feature = cc[iii];
                                fCenter = feature.geometry.getBounds()
                                                             .getCenterLonLat();
                                if (_addFeature(cluster, feature, fCenter)) {
                                    cc.splice(iii, 1);
                                    if (candidate.f.length) {
                                        candidate.sx -= fCenter.lon;
                                        candidate.sy -= fCenter.lat;
                                        _centerCluster(candidate);
                                    } else {
                                        clustered = true;
                                        break;
                                    }
                                }
                            }
                            if (clustered) {
                                break;
                            }
                        }
                    }
                    if (!clustered) {
                        clusters.push(candidate);
                    }
                }
            }
        };

        var _self = this;
        var _createClusters = function(resolution) {
            // Set distance
            _resDistance2 = _self.distance * resolution;
            _resDistance2 *= _resDistance2;

            var candidateMatches = _self.candidateMatches;
            if (candidateMatches) {
                _candidateMatches = function(a, b) {
                    return candidateMatches.call(_self, a, b);
                };
            } else {
                _candidateMatches = function() { return true; };
            }
            var finalClusters = [];
            _groupFeatures(finalClusters, _self.features);

            var i, len;
            if (_self.centered) {
                var remainingStart = 0,
                    remainingClusters;
                for (i = 0; i < 3; i++) {
                    remainingClusters = finalClusters.slice(remainingStart);
                    finalClusters = finalClusters.slice(0, remainingStart);
                    _groupClusters(
                        remainingStart, finalClusters, remainingClusters
                    );
                    var rejected = [];
                    for (var ii = finalClusters.length - 1;
                                                   ii >= remainingStart; ii--) {
                        _trimCluster(rejected, finalClusters[ii]);
                    }
                    if (!rejected.length) {
                        break;
                    }
                    remainingStart = finalClusters.length;
                    _groupFeatures(finalClusters, rejected);
                }
            }

            // We have calculated clusters on `remainingClusters`, publish it.
            _self.clustering = true;
            _self.layer.removeAllFeatures();
            var clusters = [];
            if (finalClusters.length > 0) {
                for (i = 0, len = finalClusters.length; i < len; i++) {
                    var candidate = finalClusters[i],
                        cLen = candidate.f.length;
                    if (_self.threshold && cLen < _self.threshold) {
                        Array.prototype.push.apply(clusters, candidate.f);
                    } else {
                        var cluster = new OpenLayers.Feature.Vector(
                            new OpenLayers.Geometry.Point(
                                                      candidate.x, candidate.y),
                            {count: cLen}
                        );
                        cluster.cluster = candidate.f;
                        clusters.push(cluster);
                    }
                }
                _self.layer.addFeatures(clusters);
            }
            _self.clustering = false;
        };

        var cluster = function(event) {
            if (this.enabled) {
                if (!this.features) {
                    this.features = this.layer.features.slice();
                }
                if ((!event || event.zoomChanged) && this.features.length) {
                    var resolution = this.layer.map.getResolution();
                    if (!event || resolution !== this.resolution) {
                        this.resolution = resolution;
                        _createClusters(resolution);
                    }
                }
            } else {
                if (this.features) {
                    this.uncluster();
                }
            }
        };
        this.cluster = cluster;

        // Layer listeners
        this.layerListeners = {
            'beforefeaturesadded': this.cacheFeatures,
            'featuresremoved': this.refreshCache,
            'afterfeaturemodified': this.refreshCache,
            'moveend': this.onMoveend,
            scope: this
        };

        // Store defaultSettings
        this.defaultSettings = {
            distance: this.distance,
            threshold: this.threshold,
            enabled: this.enabled,
            centered: this.centered
        };
    },

    onMoveend: function(event) {
        if (event.zoomChanged && this.zoomSettings) {
            var zoomSettings = this.zoomSettings,
                zoomLevel = this.layer.map.getZoom();
            OpenLayers.Util.extend(this, this.defaultSettings);
            for (var i = 0, len = zoomSettings.length; i < len; i++) {
                var item = zoomSettings[i];
                if (zoomLevel >= item.zoomRange[0] &&
                                               zoomLevel <= item.zoomRange[1]) {
                    OpenLayers.Util.extend(this, item.settings);
                    break;
                }
            }
        }
        this.cluster(event);
    },

    activate: function() {
        var activated = OpenLayers.Strategy.prototype.activate.call(this);
        if (activated) {
            this.cluster();
            this.layer.events.on(this.layerListeners);
        }
        return activated;
    },

    deactivate: function() {
        var deactivated = OpenLayers.Strategy.prototype.deactivate.call(this);
        if (deactivated) {
            if (this.features) {
                this.uncluster();
            }
            this.layer.events.un(this.layerListeners);
        }
        return deactivated;
    },

    cacheFeatures: function(event) {
        if (this.clustering) { return; }
        if (this.enabled) {
            var layerFeatures = this.layer.features,
                layerFeaLen = layerFeatures.length,
                features;
            if (layerFeaLen) {
                features = event.features.slice();
                for (var i = 0; i < layerFeaLen; i++) {
                    var feature = layerFeatures[i];
                    if (feature.cluster) {
                        Array.prototype.push.apply(features, feature.cluster);
                    } else {
                        features.push(feature);
                    }
                }
            } else {
                features = event.features;
            }
            this.features = features;
            this.cluster();
            return false;
        } else if (this.features) {
            this.uncluster();
        }
    },

    refreshCache: function() {
        this.cacheFeatures({features: []});
    },

    uncluster: function() {
        var features = this.features.slice();
        this.features = null;
        this.clustering = true;
        this.layer.removeAllFeatures();
        this.layer.addFeatures(features);
        this.clustering = false;
    },

    CLASS_NAME: 'OpenLayers.Strategy.CenteredCluster'
});

OpenLayers.Layer.Vector.prototype.getDataExtent = function() {
    var _maxExtent = null,
        features = this.features;
    if (features && features.length > 0) {
        var extendBounds = function(geometry) {
            if (geometry) {
                if (_maxExtent === null) {
                    _maxExtent = new OpenLayers.Bounds();
                }
                _maxExtent.extend(geometry.getBounds());
            }
        };
        for (var i = 0, len = features.length; i < len; i++) {
            var feature = features[i],
                cluster = feature.cluster;
            if (cluster) {
                for (var ii = 0, iilen = cluster.length; ii < iilen; ii++) {
                    extendBounds(cluster[ii].geometry);
                }
            } else {
                extendBounds(feature.geometry);
            }
        }
    }
    return _maxExtent;
};


}
