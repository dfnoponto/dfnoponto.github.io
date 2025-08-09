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

// CONSTANTES
var DIVS_CAIXA_FORMULARIO = ['form_referencia', 'form_cidade', 'form_linha', 'form_parada', 'form_apresentacao', 'form_speech'];
var TURNOS = ['Madrugada', 'Manhã', 'Tarde', 'Noite'];
var DIAS_SEMANA = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO', 'DOMINGO'];
var SENTIDOS = ['IDA', 'VOLTA', 'CIRCULAR'];
var LIMIT_SUGESTOES_LINHA = 10;
var QUERY_PARAM_COD_PARADA = 'codParada';
var QUERY_PARAM_SEQ_ESTACAO = 'seqEstacao';
var QUERY_PARAM_NUM_LINHA = 'numeroLinha';
var MSG_INTEGRACAO = 'Obs.: é necessário fazer integração.';
var M = {};//escopo de módulos
var WEB_SERVICE_SERVER = 'www.sistemas.dftrans.df.gov.br';
//var WEB_SERVICE_SERVER = '127.0.0.1';
var WEB_SERVICE_PROTOCOL = 'https://';
var USE_WEB_SERVER_FOR_TILES = true;
var DEFAULT_TILE_SERVERS = ['https://a.tile.openstreetmap.org', 'https://b.tile.openstreetmap.org', 'https://c.tile.openstreetmap.org'];
var ANALYTICS_ENABLE = true;
var POST_LOCATION = true;


// GLOBAIS
var isRegioesLoaded = false;
var isMapaPesquisaLoaded = false;
var listaLinhas = undefined;
var linhaSelecionada = undefined;
var linhaPesquisada = {};
var tipoLista = 'tableList';
var isHorizontalHorarioTree = true;
var recognizer;
var isSpeech;
var currentListaLinhas = [];
var isLocationDisabled = false;
var mapaFeatureStyles = {
	isCluster: function(feature) {
		return feature.cluster && feature.cluster.length > 1;
	},
	paradasDefault: new OpenLayers.Style({
        cursor: "pointer",
		label: "${label}",
		labelYOffset: '${labelY}',
		fontWeight: 'bold',
        externalGraphic: "${icone}",
        pointRadius: "${pointRadius}"
    },{
        context: {
			label: function(feature) {
				return feature.cluster && feature.cluster.length > 1 ? feature.cluster.length : '';
			},
            labelY: function(feature) {
                return !feature.layer ? 21 : feature.layer.map.getZoom() < 13 ? 5 : (feature.layer.map.getZoom() < 17) ? 7 : 80;
            },
			pointRadius: function(feature) {
				if (!feature.layer) {
					return 20;
				}

				return feature.layer.map.getZoom() < 13 ? 20 : (feature.layer.map.getZoom() < 17) ? 25 : 30;
			},
			icone: function(feature) {
				if (mapaFeatureStyles.isCluster(feature)) {
					return 'img/iconmap-cluster-parada.png';
				}
				
				return 'img/parada.svg';
			}
        }
    }),
	paradasTemporary: new OpenLayers.Style({
		cursor: 'pointer',
		externalGraphic: '${icone}',
		pointRadius: "${pointRadius}",
		label: '${label}',
		labelYOffset: '${labelY}',
		fontSize: '${fontTamanho}',
		fontWeight: 'bold'
	},{
        context: {
            label: function(feature) {
				if (mapaFeatureStyles.isCluster(feature)) {
					return feature.cluster.length;
				} else {
					if (feature.cluster) {
						feature = feature.cluster[0];
					}
				
					if (feature.attributes['codDftrans']) {
						return feature.attributes.codDftrans;
					}
					
					return '';
				}
            },
            labelY: function(feature) {
            	if (feature.layer.map.getZoom() < 13) {
					if (mapaFeatureStyles.isCluster(feature)) {
            			return 5;
            		}

            		return 23;
            	} else if (feature.layer.map.getZoom() < 17) {
					if (mapaFeatureStyles.isCluster(feature)) {
            			return 7;
            		}

            		return 28;
            	}

            	return 35;
            },
            fontTamanho: function(feature) {
            	if (feature.layer.map.getZoom() < 13) {
					if (mapaFeatureStyles.isCluster(feature)) {
						return 16;
					}

            		return 12;
            	} else if (feature.layer.map.getZoom() < 17) {
					if (mapaFeatureStyles.isCluster(feature)) {
            			return 16;
            		}

            		return 16;
            	}

            	return 23;
            },
			pointRadius: function(feature) {
				if (!feature.layer) {
					return 20;
				}

				return feature.layer.map.getZoom() < 13 ? 22 : (feature.layer.map.getZoom() < 17) ? 27 : 32;
			},
			icone: function(feature) {
				if (mapaFeatureStyles.isCluster(feature)) {
					return 'img/iconmap-cluster-parada.png';
				}

				return 'img/parada.svg';
			}
        }
    })
};
var mapa = {
	isCluster: function(feature) {
		return feature.cluster && feature.cluster.length > 1;
	},
	styles: {
		paradasLayer: new OpenLayers.StyleMap({
	        'default': mapaFeatureStyles.paradasDefault,
	        'temporary': mapaFeatureStyles.paradasTemporary
	    }),
	    newSelectedsLayer: function() {
	    	return new OpenLayers.StyleMap({
		        'default': new OpenLayers.Style({
		            cursor: "pointer",
		            externalGraphic: '${icone}',
		            graphicYOffset: "${localY}",
	        		pointRadius: "${pointRadius}"
		        },{
		            context: {
		                localY: function(feature) {
		                    return feature.layer.map.getZoom() < 13 ? -40 : (feature.layer.map.getZoom() < 17) ? -48 : -40;
		                },
						pointRadius: function(feature) {
							if (!feature.layer) {
								return 20;
							}

							return feature.layer.map.getZoom() < 13 ? 20 : (feature.layer.map.getZoom() < 17) ? 25 : 30;
						},
						icone: function(feature) {
							return feature == mapaParadas.origemFeature ? 'img/iconmap-origem.png' : 'img/iconmap-destino.png';
						}
		            }
		        }),
		        'temporary': new OpenLayers.Style({
					cursor: 'pointer',
					externalGraphic: '${icone}',
					label: '${label}',
					labelYOffset: '${labelY}',
					fontSize: '${fontTamanho}',
					fontWeight: 'bold',
	        		pointRadius: "${pointRadius}"
				},{
		            context: {
		                label: function(feature) {
		                    if (feature.attributes['descricao']) {
		                        return feature.attributes.descricao;
		                    } else if (feature.attributes['codDftrans']) {
		                    	return feature.attributes.codDftrans;
		                    }
		                    return '';
		                },
		                labelY: function(feature) {
		                    return feature.layer.map.getZoom() < 13 ? 45 : (feature.layer.map.getZoom() < 17) ? 55 : 53;
		                },
		                fontTamanho: function(feature) {
		                    return feature.layer.map.getZoom() < 13 ? 13 : (feature.layer.map.getZoom() < 17) ? 16 : 20;
		                },
						pointRadius: function(feature) {
							if (!feature.layer) {
								return 20;
							}

							return feature.layer.map.getZoom() < 13 ? 20 : (feature.layer.map.getZoom() < 17) ? 25 : 30;
						},
						icone: function(feature) {
							return feature == mapaParadas.origemFeature ? 'img/iconmap-origem.png' : 'img/iconmap-destino.png';
						}
		            }
		        })
		    });
	    },
		//selectedsLayer: newSelectedsLayer(),
	    /*postosLayer: new OpenLayers.StyleMap({
	        'default': new OpenLayers.Style({
	            cursor: "pointer",
	            externalGraphic: 'img/posto_sba.svg',
        		pointRadius: "${pointRadius}"
	        },{
	            context: {
					pointRadius: function(feature) {
						if (!feature.layer) {
							return 20;
						}

						return feature.layer.map.getZoom() < 13 ? 20 : (feature.layer.map.getZoom() < 17) ? 25 : 30;
					}
	            }
	        }),
	        'temporary': new OpenLayers.Style({
				cursor: 'pointer',
				externalGraphic: 'img/posto_sba.svg',
				label: '${label}',
				labelXOffset: '${labelX}',
				labelYOffset: '${labelY}',
				fontSize: '${fontTamanho}',
				fontWeight: 'bold',
        		pointRadius: "${pointRadius}"
			},{
	            context: {
	                label: function(feature) {
	                    if (feature.attributes['descricao']) {
	                        return feature.attributes.descricao;
	                    }

	                    return '';
	                },
	                labelX: function(feature) {
	                    return feature.layer.map.getZoom() < 13 ? 2 : (feature.layer.map.getZoom() <= 17) ? 4 : 0;
	                },
	                labelY: function(feature) {
	                    return feature.layer.map.getZoom() < 13 ? 23 : (feature.layer.map.getZoom() <= 17) ? 30 : 38;
	                },
	                fontTamanho: function(feature) {
	                    return feature.layer.map.getZoom() < 13 ? 9 : (feature.layer.map.getZoom() <= 17) ? 13 : 18;
	                },
	                pointRadius: function(feature) {
						if (!feature.layer) {
							return 20;
						}

						return feature.layer.map.getZoom() < 13 ? 22 : (feature.layer.map.getZoom() < 17) ? 27 : 32;
					}
	            }
	        })
	    })*/
	    postosLayer: new OpenLayers.StyleMap({
	        'default': new OpenLayers.Style({
	            cursor: "pointer",
				label: "${label}",
				labelYOffset: '${labelY}',
				fontWeight: 'bold',
	            externalGraphic: "${icone}",
        		pointRadius: "${pointRadius}"
	        },{
	            context: {
					label: function(feature) {
						return feature.cluster && feature.cluster.length > 1 ? feature.cluster.length : '';
					},
	                labelY: function(feature) {
	                    return feature.layer.map.getZoom() < 13 ? 5 : (feature.layer.map.getZoom() <= 17) ? 5 : 5;
	                },
					icone: function(feature) {
						return (mapa.isCluster(feature)) ? 'img/iconmap-cluster-postosba.png' : 'img/posto_sba.svg';
					},
	                pointRadius: function(feature) {
						if (!feature.layer) {
							return 20;
						}

						return feature.layer.map.getZoom() < 13 ? 20 : (feature.layer.map.getZoom() < 17) ? 25 : 30;
					}
	            }
	        }),
	        'temporary': new OpenLayers.Style({
				cursor: 'pointer',
				externalGraphic: '${icone}',
				label: '${label}',
				labelYOffset: '${labelY}',
				fontSize: '${fontTamanho}',
				fontWeight: 'bold',
        		pointRadius: "${pointRadius}"
			},{
	            context: {
	                label: function(feature) {
						if (mapa.isCluster(feature)) {
							return feature.cluster.length;
						} else {
							if (feature.cluster) {
								feature = feature.cluster[0];
							}
							
							return feature.attributes.descricao;
						}
	                },
	                labelY: function(feature) {
	                	if (feature.layer.map.getZoom() < 13) {
							if (mapa.isCluster(feature)) {
	                			return 7;
	                		}

	                		return 23;
	                	} else if (feature.layer.map.getZoom() <= 17) {
							if (mapa.isCluster(feature)) {
	                			return 8;
	                		}

	                		return 31;
	                	}

	                	return 38;
	                },
	                fontTamanho: function(feature) {
	                	if (feature.layer.map.getZoom() < 13) {
							if (mapa.isCluster(feature)) {
								return 16;
							}

	                		return 9;
	                	} else if (feature.layer.map.getZoom() <= 17) {
							if (mapa.isCluster(feature)) {
	                			return 16;
	                		}

	                		return 14;
	                	}

	                	return 23;
	                },
					icone: function(feature) {
						return (mapa.isCluster(feature)) ? 'img/iconmap-cluster-postosba.png' : 'img/posto_sba.svg';
					},
	                pointRadius: function(feature) {
						if (!feature.layer) {
							return 20;
						}

						return feature.layer.map.getZoom() < 13 ? 22 : (feature.layer.map.getZoom() < 17) ? 27 : 32;
					}
	            }
	        })
	    }),
	    terminaisLayer: new OpenLayers.StyleMap({
	        'default': new OpenLayers.Style({
	            cursor: "pointer",
				label: "${label}",
				labelYOffset: '${labelY}',
				fontWeight: 'bold',
	            externalGraphic: "${icone}",
        		pointRadius: "${pointRadius}"
	        },{
	            context: {
					label: function(feature) {
						return feature.cluster && feature.cluster.length > 1 ? feature.cluster.length : '';
					},
	                labelY: function(feature) {
	                    return feature.layer.map.getZoom() < 13 ? 5 : (feature.layer.map.getZoom() <= 17) ? 5 : 5;
	                },
					icone: function(feature) {
						if (mapa.isCluster(feature)) {
							return 'img/iconmap-cluster-terminal.png';
						}

						if (feature.attributes.tipo) {
							if (feature.attributes.tipo == 'M') {
								return 'img/terminal_metro.svg';
							} else if (feature.attributes.tipo == 'B') {
								return 'img/terminal_brt.svg';
							}
						}

						return 'img/terminal.svg';
					},
	                pointRadius: function(feature) {
						if (!feature.layer) {
							return 20;
						}

						return feature.layer.map.getZoom() < 13 ? 20 : (feature.layer.map.getZoom() < 17) ? 25 : 30;
					}
	            }
	        }),
	        'temporary': new OpenLayers.Style({
				cursor: 'pointer',
				externalGraphic: '${icone}',
				label: '${label}',
				labelYOffset: '${labelY}',
				fontSize: '${fontTamanho}',
				fontWeight: 'bold',
        		pointRadius: "${pointRadius}"
			},{
	            context: {
	                label: function(feature) {
						if (mapa.isCluster(feature)) {
							return feature.cluster.length;
						} else {
							if (feature.cluster) {
								feature = feature.cluster[0];
							}
							
							return feature.attributes.descricao;
						}
	                },
	                labelY: function(feature) {
	                	if (feature.layer.map.getZoom() < 13) {
							if (mapa.isCluster(feature)) {
	                			return 7;
	                		}

	                		return 23;
	                	} else if (feature.layer.map.getZoom() <= 17) {
							if (mapa.isCluster(feature)) {
	                			return 8;
	                		}

	                		return 31;
	                	}

	                	return 38;
	                },
	                fontTamanho: function(feature) {
	                	if (feature.layer.map.getZoom() < 13) {
							if (mapa.isCluster(feature)) {
								return 16;
							}

	                		return 9;
	                	} else if (feature.layer.map.getZoom() <= 17) {
							if (mapa.isCluster(feature)) {
	                			return 16;
	                		}

	                		return 14;
	                	}

	                	return 23;
	                },
					icone: function(feature) {
						if (mapa.isCluster(feature)) {
							return 'img/iconmap-cluster-terminal.png';
						}

						if (feature.attributes.tipo) {
							if (feature.attributes.tipo == 'M') {
								return 'img/terminal_metro.svg';
							} else if (feature.attributes.tipo == 'B') {
								return 'img/terminal_brt.svg';
							}
						}

						return 'img/terminal.svg';
					},
	                pointRadius: function(feature) {
						if (!feature.layer) {
							return 20;
						}

						return feature.layer.map.getZoom() < 13 ? 22 : (feature.layer.map.getZoom() < 17) ? 27 : 32;
					}
	            }
	        })
	    }),
	    bicicletariosLayer: new OpenLayers.StyleMap({
	        'default': new OpenLayers.Style({
	            cursor: "pointer",
				label: "${label}",
				labelYOffset: '${labelY}',
				fontWeight: 'bold',
	            externalGraphic: "${icone}",
        		pointRadius: "${pointRadius}"
	        },{
	            context: {
					label: function(feature) {
						return feature.cluster && feature.cluster.length > 1 ? feature.cluster.length : '';
					},
	                labelY: function(feature) {
	                    return 5;
	                },
					icone: function(feature) {
						if (mapa.isCluster(feature)) {
							return 'img/iconmap-cluster-bike.png';
						}
						
						return 'img/bike.svg';
					},
	                pointRadius: function(feature) {
						if (!feature.layer) {
							return 20;
						}

						return feature.layer.map.getZoom() < 13 ? 20 : (feature.layer.map.getZoom() < 17) ? 25 : 30;
					}
	            }
	        }),
	        'temporary': new OpenLayers.Style({
				cursor: 'pointer',
				externalGraphic: '${icone}',
				label: '${label}',
				labelYOffset: '${labelY}',
				fontSize: '${fontTamanho}',
				fontWeight: 'bold',
        		pointRadius: "${pointRadius}"
			},{
	            context: {
	                label: function(feature) {
						if (mapa.isCluster(feature)) {
							return feature.cluster.length;
						} else {
							if (feature.cluster) {
								feature = feature.cluster[0];
							}
							
							return feature.attributes.descricao;
						}
	                },
	                labelY: function(feature) {
	                	if (feature.layer.map.getZoom() < 13) {
							if (mapa.isCluster(feature)) {
	                			return 7;
	                		}

	                		return 23;
	                	} else if (feature.layer.map.getZoom() <= 17) {
							if (mapa.isCluster(feature)) {
	                			return 8;
	                		}

	                		return 31;
	                	}

	                	return 38;
	                },
	                fontTamanho: function(feature) {
	                	if (feature.layer.map.getZoom() < 13) {
							if (mapa.isCluster(feature)) {
								return 16;
							}

	                		return 9;
	                	} else if (feature.layer.map.getZoom() <= 17) {
							if (mapa.isCluster(feature)) {
	                			return 16;
	                		}

	                		return 14;
	                	}

	                	return 23;
	                },
					icone: function(feature) {
						if (mapa.isCluster(feature)) {
							return 'img/iconmap-cluster-bike.png';
						}

						return 'img/bike.svg';
					},
	                pointRadius: function(feature) {
						if (!feature.layer) {
							return 20;
						}

						return feature.layer.map.getZoom() < 13 ? 22 : (feature.layer.map.getZoom() < 17) ? 27 : 32;
					}
	            }
	        })
	    }),
	   	integracaoLayer: new OpenLayers.StyleMap({
	        'default': new OpenLayers.Style({
	            cursor: "pointer",
				label: "Área integração",
				labelYOffset: '5',
				fontWeight: 'bold',
	            externalGraphic: "img/iconmap-cluster-postosba.png",
        		pointRadius: "20",
        		background: "green"
	        })
	    }),
	    veiculosLayer: new OpenLayers.StyleMap({
	    	'default': new OpenLayers.Style({
	            cursor: "pointer",
				labelYOffset: '${labelY}',
				fontWeight: 'bold',
				graphicYOffset: '${yOffset}',
	            externalGraphic: "${icone}",
        		pointRadius: "${pointRadius}"
	        },{
	            context: {
	                labelY: function(feature) {
	                    return feature.layer.map.getZoom() < 13 ? 5 : (feature.layer.map.getZoom() <= 17) ? 5 : 5;
	                },
					yOffset: function(feature) {
						return feature.layer.map.getZoom() < 13 ? -27 : (feature.layer.map.getZoom() < 17) ? -35 : -50;
					},
					icone: function(feature) {
						if (!feature.attributes.operadora) {
							return 'img/iconmap-bus-grey.png';
						}

						if (feature.attributes.operadora.toUpperCase().indexOf('MARECHAL') != -1) {
							return 'img/iconmap-bus-orange.png';
						} else if (feature.attributes.operadora.toUpperCase().indexOf('PIRACICABANA') != -1) {
							return 'img/iconmap-bus-purple.png';
						} else if (feature.attributes.operadora.toUpperCase().indexOf('PIONEIRA') != -1) {
							return 'img/iconmap-bus-yellow.png';
						} else if (feature.attributes.operadora.toUpperCase().indexOf('URBI') != -1) {
							return 'img/iconmap-bus-blue.png';
						}

						return 'img/iconmap-bus-grey.png';
					},
	                pointRadius: function(feature) {
	                	if (!feature.layer) {
							return 20;
						}

						return feature.layer.map.getZoom() < 13 ? 15 : (feature.layer.map.getZoom() < 17) ? 20 : 25;
					}
	            }
	        }),
	        'temporary': new OpenLayers.Style({
				cursor: 'pointer',
				externalGraphic: '${icone}',
				label: '${label}',
				labelYOffset: '${labelY}',
				graphicYOffset: '${yOffset}',
				fontSize: '${fontTamanho}',
				fontWeight: 'bold',
        		pointRadius: "${pointRadius}"
			},{
	            context: {
	                label: function(feature) {
						return 'Veículo: ' + feature.attributes.numero;
	                },
	                labelY: function(feature) {
	                	return (feature.layer.map.getZoom() < 13) ? 35 : feature.layer.map.getZoom() < 17 ? 45 : 65;
	                },
					yOffset: function(feature) {
						return feature.layer.map.getZoom() < 13 ? -29 : (feature.layer.map.getZoom() < 17) ? -37 : -52;
					},
	                fontTamanho: function(feature) {
	                	if (feature.layer.map.getZoom() < 13) {
		            		return 12;
		            	} else if (feature.layer.map.getZoom() < 17) {

		            		return 16;
		            	}

		            	return 23;
	                },
					icone: function(feature) {
						if (!feature.attributes.operadora) {
							return 'img/iconmap-bus-grey.png';
						}

						if (feature.attributes.operadora.toUpperCase().indexOf('MARECHAL') != -1) {
							return 'img/iconmap-bus-orange.png';
						} else if (feature.attributes.operadora.toUpperCase().indexOf('PIRACICABANA') != -1) {
							return 'img/iconmap-bus-purple.png';
						} else if (feature.attributes.operadora.toUpperCase().indexOf('PIONEIRA') != -1) {
							return 'img/iconmap-bus-yellow.png';
						} else if (feature.attributes.operadora.toUpperCase().indexOf('URBI') != -1) {
							return 'img/iconmap-bus-blue.png';
						}

						return 'img/iconmap-bus-grey.png';
					},
	                pointRadius: function(feature) {
	                	if (!feature.layer) {
							return 22;
						}

						return feature.layer.map.getZoom() < 13 ? 17 : (feature.layer.map.getZoom() < 17) ? 22 : 27;
					}
	            }
	        })
	    })
	}
};
var mapaParadas = {
	// Mapa
	map: undefined,
	// Último feature selecionado
	selectedFeature: undefined,
	// Feature definido como origem
	origemFeature: undefined,
	// Feature definido como destino
	destinoFeature: undefined,
	// Configura um feature como origem
	setOrigemFeature: function(feature) {
		if (this.destinoFeature == feature) {
			this.destinoFeature = this.origemFeature;
		}

		this.origemFeature = feature;
	},
	// Configura um feature como destino
	setDestinoFeature: function(feature) {
		if (this.origemFeature == feature) {
			this.origemFeature = this.destinoFeature;
		}

		this.destinoFeature = feature;
	},
	// Esquece os features selecionados de origem e destino
	resetSelectedFeatures: function() {
		this.origemFeature = this.destinoFeature = undefined;
		if (this.selectedsLayer) {
			this.selectedsLayer.removeAllFeatures();
		}
	},
	// Requisita a localização do usuário
	requestLocation: function() {
		requestLocation(function(position) {
			var mapa = mapaParadas.map;

			var lonLat = new OpenLayers.LonLat(position.coords.longitude, position.coords.latitude);

        	mapa.setCenter(lonLat.transform(new OpenLayers.Projection("EPSG:4326"), mapa.getProjectionObject()), 17);

        	var markers;
        	if (mapa.getLayersByName('markers')[0]) {
				markers = mapa.getLayersByName('markers')[0];
				markers.removeAllFeatures();
        	} else {
        		markers = new OpenLayers.Layer.Vector("markers");
        		markers.styleMap = new OpenLayers.StyleMap({
                    externalGraphic: "ol/img/marker.png",
                    pointRadius: 13,
                    graphicZIndex: 100
                });

        		mapa.addLayer(markers);
        		//mapa.setLayerZIndex(markers, 100);
        	}

        	markers.addFeatures(new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(lonLat.lon, lonLat.lat)));
		});
	},
	// Evento de click sobre um feature no mapa
	onFeatureClick: function(evt) {
		if (evt.feature.cluster) {
			if (evt.feature.cluster.length == 1) {
				mapaParadas.showMapaParadasDialog(evt.feature.cluster[0]);
			} else {	// Caso o feature seja um cluster de features, zoomIn no mesmo
				this.map.panTo(new OpenLayers.LonLat(evt.feature.geometry.bounds.left, evt.feature.geometry.bounds.top));
				this.map.zoomIn();
			}
		} else {
			mapaParadas.showMapaParadasDialog(evt.feature);
		}

		evt.feature.layer.drawFeature(evt.feature);
	},
	// Atente ao evento de seleção de um ponto no mapa de paradas.
	showMapaParadasDialog: function(feature) {
		this.selectedFeature = feature;
		var featureData = feature.attributes;
		
		// Obtem um objeto com as propriedades de um feature (label: valor)
		function getPropertiesMap(feature) {
			var map = {};

			if (feature.featureType == 'estacao' || feature.featureType == 'parada') {
				if (feature.codDftrans) {
					map['Código'] = feature.codDftrans;
				} else if ('sequencial' in feature) {
					map['Nº'] = feature.sequencial;
				}
			}
			
			if (feature.sentido) {
				map['Sentido'] = feature.sentido;
			}
			
			if (feature.descricao) {
				map['Descrição'] = feature.descricao;
			}
			
			if (feature.tipo && feature.tipo == 'R') {
				map['Tipo'] = 'T. Rodoviário';
			}

			if (feature.realizaVenda) {
				map['Faz venda'] = 'sim';
			}

			if (feature.realizaEmissao) {
				map['Faz emissão'] = 'sim';
			}
			
			return map;
		}

		// Obtem a descrição do tipo do feature
		function getFeatureType(featureData) {
			if (featureData.featureType == 'parada')  {
				return 'Parada';
			} else if (featureData.featureType == 'bicicletario') {
				return 'Bicicletário';
			} else if (featureData.featureType == 'estacao') {
				return 'Terminal';
			} else if (featureData.featureType == 'postosba') {
				return 'Posto SBA';
			}
		}

		// Cria um header para a tabela
		function createTableHeader(label) {
			var row = document.createElement('tr');

			var columnHeader = document.createElement('th');
			columnHeader.colSpan = '2';
			columnHeader.innerHTML = label;
			columnHeader.class = 'mapa_table_header_row';

			row.appendChild(columnHeader);

			return row;
		}
		
		// Cria um linha de tabela para um par label: valor
		function createTableRow(label, value) {
			var row = document.createElement('tr');
			
			var columnLabel = document.createElement('td');
			columnLabel.className = 'mapa_table_column_label';
			columnLabel.innerHTML = label + ': ';
			
			var columnValue = document.createElement('td');
			columnValue.className = 'mapa_table_column_value';
			columnValue.innerHTML = value;
			
			row.appendChild(columnLabel);
			row.appendChild(columnValue);
			
			return row;
		}
		
		$('#mapa-parada-dialogo').animate({width: 'show'}, 200, 'linear', function() {
			// Configura width mínimo para o container do conteúdo para que a animação de fechamento não altere a forma do conteúdo
			var $container = $('#mapa-parada-dialogo-container');
			$container.css('min-width', $container.width());
			
			// Popula a tabela com as propriedades da parada selecionada
			var table = document.getElementById('mapa-parada-table').getElementsByTagName('tbody')[0];
			table.innerHTML = '';
			table.appendChild(createTableHeader(getFeatureType(featureData)));

			var map = getPropertiesMap(featureData);
			var keys = Object.keys(map);
			for (var i = 0; i < keys.length; i++) {
				table.appendChild(createTableRow(keys[i], map[keys[i]]));
			}

			// Mostra os botão switch origem/destino
			showParadaSwitch();
			// Remove o estado de banner do mapa table.
			var $mapaTable = $('#mapa-parada-table');
			$mapaTable.removeClass('mapa_table_banner');
			$mapaTable.addClass('mapa_table');
			
			// Caso a parada já esteja assinalada como origem/destino, configurar radio como tal
			var num = ('seqEstacao' in featureData) ? featureData.seqEstacao : featureData.codDftrans;
			if (num == $('.form_parada_origem').val()) {
				change_sentido_radio('radioParadaContainer', 'origem');
			} else if (num == $('.form_parada_destino').val()) {
				change_sentido_radio('radioParadaContainer', 'destino');
			} else {
				// Reset do radio de pesquisa de parada
				change_sentido_radio('radioParadaContainer', null);
			}
		});
	},
	// Centraliza o mapa no feature origem
	centerToOrigem: function() {
		if (this.origemFeature) {
			this.centerToFeature(this.origemFeature);
		}
	},
	// Centraliza o mapa no feature destino
	centerToDestino: function() {
		if (this.destinoFeature) {
			this.centerToFeature(this.destinoFeature);
		}
	},
	// Centraliza o mapa num feature
	centerToFeature: function(feature) {
		this.map.setCenter(new OpenLayers.LonLat(feature.geometry.bounds.left, feature.geometry.bounds.top), this.map.getZoom());
	}
};
var mapaPercurso = {
	map: undefined,
	linhaLayer: undefined,
	selectedsLayer: undefined,
	paradasLayer: undefined,
	veiculosLayer: undefined,
	integracaoLayer: undefined,
	isClusterDisabled: false,
	zoomLevelClusterDisabled: 16,
	currentLinha: undefined,
	controlClickPopup: undefined,
	currentPopupParada: {parada: undefined, popup: undefined, horarios: undefined, horario: undefined, _currentLoad: undefined},
	popupContainerId: 'mapaPercusoPopupContainer',
	disablePopupParada: true,
	veiculosInterval: undefined,
	veiculosIntervalCount: undefined,
	paradasLayerVisible: undefined,
	checkboxParadasId: 'checkboxParadasMapaPercurso',
	panelVeiculosId: 'mapa-linha-veiculos-btn',
	panelVeiculosTableContainerId: 'mapa_linha_veiculos_table_container',
	panelVeiculosTotalFieldId: 'mapa_linha_veiculos_total_field',
	// Inicializa o mapa
	initMap: function() {
		this.map = initMap('map_linha');
		$('#map_linha').on('mousewheel', function(evt) { evt.preventDefault(); });
	},
	// Carrega o percurso respectivo a uma linha
	loadPercurso: function(linha) {
		this.currentLinha = linha;

		if (this.map == undefined) {
			this.initMap();
		} else if (this.linhaLayer) {
			this.map.removeLayer(this.linhaLayer);
		}

		var map = this.map;

		// Estilo da linha    
	    var stylesLinha = new OpenLayers.Style({
	        pointRadius: 10,
	        strokeColor: "red",
	        strokeOpacity: 0.5,
	        strokeWidth: "${larguraLinha}"
	    },{
	        context: {                        
	            larguraLinha: function(feature) {
	                return feature.layer.map.getZoom() < 13 ? 5 : feature.layer.map.getZoom() <= 17 ? 10 : 20;
	            }
	        }
	    });

	    // Vetores
	    this.linhaLayer = new OpenLayers.Layer.Vector('linha', {
	        protocol: new OpenLayers.Protocol.HTTP({
	            isBaseLayer: true,
				url: WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/percurso/linha/' + linha.sequencial,
	            format: new OpenLayers.Format.GeoJSON()
	        }),
	        strategies: [new OpenLayers.Strategy.Fixed()],
	        eventListeners: {
	            'loadend': function(evt) {
	            	if (evt.object.map) {
	                	evt.object.map.zoomToExtent(evt.object.getDataExtent());
	                }

	                setTimeout(function() {
	                	map.updateSize();
	                }, 1000);
	            }
	        }
	    });

	    this.linhaLayer.styleMap = new OpenLayers.StyleMap(stylesLinha);

		map.addLayer(this.linhaLayer);
	},
	// Carrega as paradas respectivas a uma linha
	loadParadas: function(linha) {
		var self = this;

		if (this.paradasLayer) {
			this.paradasLayer.removeAllFeatures();
			this.map.removeLayer(this.paradasLayer);
		}

		this.paradasLayer = new OpenLayers.Layer.Vector('paradas', {
	        protocol: new OpenLayers.Protocol.HTTP({
	            isBaseLayer: true,
				url: WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/parada/geo/paradas/linha/' + linha.sequencial,
	            format: new OpenLayers.Format.GeoJSON()
	        }),
	        strategies: [
	        	new OpenLayers.Strategy.CenteredCluster({
					    autoActivate: true,
					    threshold: 2,
					    distance: 45
				}),
	        	new OpenLayers.Strategy.Fixed()
	    	]
	    });

	    this.paradasLayer.styleMap = mapa.styles.paradasLayer;
	    this.map.addLayer(this.paradasLayer);

	    this.veiculosLayer = this.loadVeiculos(linha);

	    //this.addControlSelectToLayer(this.paradasLayer);
	    var controlSelect = new OpenLayers.Control.SelectFeature([this.paradasLayer, this.veiculosLayer], {
			hover: true,
			highlightOnly: true,
			renderIntent: "temporary"
		});
		this.map.addControl(controlSelect);
	    controlSelect.activate();


	    // Evento de click 
		this.paradasLayer.events.on({
	        'featureselected': self.onFeatureClick
	    });

	    this.veiculosLayer.events.register('featuresadded', this.veiculosLayer, function(data) {
		    self.updateVeiculosPanel(data.features);
		});
		this.veiculosLayer.events.register('loadend', this.veiculosLayer, function(data) {
		    self._onLayerVeiculosLoadEnd(data.response);
		});

	    this.controlClickPopup = new OpenLayers.Control.SelectFeature([this.paradasLayer, this.veiculosLayer], {
	    	onSelect: function(f) {
	    		if (!f.cluster) {
	    			self.showPopupFeature(f);
	    		}
	    	},
	    	onUnselect: function() {self.destroyPopupParada()},
			clickout: true,
			selectStyle: 'temporary'/*mapaFeatureStyles.paradasTemporary*/
		});
		self.map.addControl(this.controlClickPopup);
		this.controlClickPopup.activate();


	    // Desativa a strategie cluster de marcadores quando o zoom chega a self.zoomLevelClusterDisabled
		this.map.events.register('zoomend', this.map, function () {
			var currentZoom = self.map.getZoom();
			
			if (!self.isClusterDisabled && currentZoom >= self.zoomLevelClusterDisabled) {
				self.isClusterDisabled = true;
				self.paradasLayer.strategies[0].deactivate();
			} else if (self.isClusterDisabled && currentZoom < self.zoomLevelClusterDisabled) {
				self.isClusterDisabled = false;
				self.paradasLayer.strategies[0].activate();
			}
	    });
	    this.map.events.register('click', map, function(event) {
			self.destroyAllPopups();
		});

	    //this.removeSelectedFeatures();

	    this.startUpdateVeiculos();

	    if (this.paradasLayerVisible == undefined) {
	    	this.setVisibilityParadasLayer(true);
	    } else {
	    	this.setVisibilityParadasLayer(this.paradasLayerVisible);
	    }
	},
	// Carrega uma área de integração
	loadAreaIntegracao: function(areaIntegracao) {
		if (this.integracaoLayer) {
			this.integracaoLayer.removeAllFeatures();
			this.map.removeLayer(this.integracaoLayer);
		}

		this.integracaoLayer = new OpenLayers.Layer.Vector('integracao', {
	        protocol: new OpenLayers.Protocol.HTTP({
	            isBaseLayer: true,
				url: WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/areaintegracao/geo/' + areaIntegracao.sequencial,
	            format: new OpenLayers.Format.GeoJSON()
	        }),
	        strategies: [ new OpenLayers.Strategy.Fixed() ]
	    });

		this.integracaoLayer.styleMap = mapa.styles.integracaoLayer;
	    this.map.addLayer(this.integracaoLayer);
	    this.addControlSelectToLayer(this.integracaoLayer);
	},
	// Carrega veículos de uma linha
	loadVeiculos: function(linha) {
		if (linha == undefined) {
			linha = this.currentLinha;
		}

		if (this.veiculosLayer) {
			this.veiculosLayer.removeAllFeatures();
			this.map.removeLayer(this.veiculosLayer);
		}

		this.veiculosLayer = new OpenLayers.Layer.Vector('veiculos', {
			projection: new OpenLayers.Projection('EPSG:4326'),
			protocol: new OpenLayers.Protocol.HTTP({
	            isBaseLayer: true,
				url: WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/gps/linha/' + linha.numero + '/geo/recent',
	            format: new OpenLayers.Format.GeoJSON()
	        }),
	        strategies: [ new OpenLayers.Strategy.Fixed() ]
		});

		this.veiculosLayer.styleMap = mapa.styles.veiculosLayer;
	    this.map.addLayer(this.veiculosLayer);

	    return this.veiculosLayer;
	},
	// Exibe um popup sobre um dado feature
	showPopupFeature: function(feature) {
		if (feature.layer.name == 'paradas') {
			 if (!this.disablePopupParada) {
			 	this.showPopupParada(feature);
			 }
		} else if (feature.layer.name == 'veiculos') {
			this.showPopupVeiculos(feature);
		}
	},
	// Exibe um popup sobre um dado veículo
	showPopupVeiculos: function(feature) {
		this.destroyAllPopups();

		var self = this;
		this.currentPopupParada.parada = feature;
		this.currentPopupParada.popup = new OpenLayers.Popup.FramedCloud("pop" + feature.attributes.numero, 
			feature.geometry.getBounds().getCenterLonLat(), 
			null,
			this.loadPopupVeiculo(feature).outerHTML,
			null,
			true, 
			function() {self.controlClickPopup.unselectAll(); });

		//feature.popup.closeOnMove = true;
		this.map.addPopup(this.currentPopupParada.popup);

		this.currentPopupParada.popup.closeDiv.addEventListener('click', function() {
			self.destroyAllPopups();
		});
	},
	// Exibe um popup sobre uma dada parada
	showPopupParada: function(feature) {
		var self = this;
		this.currentPopupParada.parada = feature;
		this.currentPopupParada.popup = new OpenLayers.Popup.FramedCloud("pop", 
			feature.geometry.getBounds().getCenterLonLat(), 
			null,
			this.loadPopup(feature).outerHTML,
			null,
			true, 
			function() {self.controlClickPopup.unselectAll(); });

		//feature.popup.closeOnMove = true;
		this.map.addPopup(this.currentPopupParada.popup);
	},
	// Destroy o popup de parada corrente
	destroyPopupParada: function() {
		if (this.currentPopupParada.popup != undefined) {
			this.currentPopupParada.parada = undefined;
			this.currentPopupParada.popup.destroy();
			this.currentPopupParada.popup = undefined;
			this.currentPopupParada._currentLoad = undefined;
			this.currentPopupParada.horario = this.currentPopupParada.horarios = undefined;
		}
	},
	// Destroy todos os popups
	destroyAllPopups: function() {
		this.destroyPopupParada();
		this.map.popups.forEach(function(p) {
			p.destroy();
		});
	},
	// Remove features da layer de selecionados
	removeSelectedFeatures: function() {
		if (this.selectedsLayer) {
			this.selectedsLayer.removeAllFeatures();
			this.map.removeLayer(this.selectedsLayer);
			this.selectedsLayer = undefined;
		}
	},
	// Adiciona features à layer de selecionados
	addSelectedFeatures: function(features) {
		if (this.selectedsLayer) {
			this.removeSelectedFeatures();
		}

		// Criação da layer
		this.selectedsLayer = new OpenLayers.Layer.Vector('selecionados');
		this.selectedsLayer.styleMap = mapa.styles.newSelectedsLayer();
		this.map.addLayer(this.selectedsLayer);

		this.addControlSelectToLayer(this.selectedsLayer);

		this.selectedsLayer.addFeatures(features);
	},
	// Controle hover sobre os features da layer
	addControlSelectToLayer: function(layer) {
		var controlSelect = new OpenLayers.Control.SelectFeature([layer], {
			hover: true,
			highlightOnly: true,
			renderIntent: "temporary"
		});
		this.map.addControl(controlSelect);
	    controlSelect.activate();
	},
	// Evento de click sobre um feature no mapa
	onFeatureClick: function(evt) {
		if (evt.feature.cluster && evt.feature.cluster.length > 1) {
			this.map.panTo(new OpenLayers.LonLat(evt.feature.geometry.bounds.left, evt.feature.geometry.bounds.top));
			this.map.zoomIn();
		}

		evt.feature.layer.drawFeature(evt.feature);
	},
	// Requisita a localização do usuário
	requestLocation: function(dontCenterMap, hideNotification) {
		var self = this;
		requestLocation(function(position) {
			var mapa = self.map;

			var lonLat = new OpenLayers.LonLat(position.coords.longitude, position.coords.latitude);

			lonLat = lonLat.transform(new OpenLayers.Projection("EPSG:4326"), mapa.getProjectionObject())

			if (dontCenterMap == undefined || dontCenterMap == false) {
        		mapa.setCenter(lonLat, 17);
        	}

        	var markers;
        	if (mapa.getLayersByName('markers')[0]) {
				markers = mapa.getLayersByName('markers')[0];
				markers.removeAllFeatures();
        	} else {
        		markers = new OpenLayers.Layer.Vector("markers");
        		markers.styleMap = new OpenLayers.StyleMap({
                    externalGraphic: "ol/img/marker.png",
                    pointRadius: 13,
                    graphicZIndex: 100
                });

        		mapa.addLayer(markers);
        	}

        	markers.addFeatures(new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(lonLat.lon, lonLat.lat)));
		}, hideNotification);
	},
	// Obtem o popup referente a uma parada selecionada
	loadPopup: function(feature) {
		var self = this;

		if (this.currentPopupParada._currentLoad == feature) {
			return;
		}

		this.currentPopupParada._currentLoad = feature;

		pesquisarHorariosParada(
			feature.attributes.codDftrans,
			this.currentLinha.numero,
			this.currentLinha.sentido,
			getCurrentDiaPadrao(),
			function(data) {
				if (feature == self.currentPopupParada._currentLoad) {
					self.setupHorariosPopup(data);
					self.nextHorarioPopup();
				}
			}, undefined,
			function() {
				if (feature == self.currentPopupParada._currentLoad) {
					$('#' + self.popupContainerId).html('<span style="color: white;">ERROR</span>');
				}
			}
		);

		return this.createPopupParada(feature.attributes, this.currentLinha);
	},
	// Obtem o popup referente a um veículo selecionado
	loadPopupVeiculo: function(feature) {
		var veiculo = feature.attributes;

		var container = document.createElement('div');
		container.id = this.popupContainerId;
		container.className = 'mapa_percurso_popup_container';
		
		var table = document.createElement('table');
		table.className = 'mapa_percurso_popup_table';
		var tbody = document.createElement('tbody');
		table.appendChild(tbody);


		tbody.appendChild($('<tr><td colspan="3" class="mapa_percurso_popup_table_title">Veículo</td></tr>')[0]);
		tbody.appendChild($('<tr><td class="mapa_percurso_popup_table_label">Número</td><td class="mapa_percurso_popup_table_spacer">:</td><td class="mapa_percurso_popup_table_value">'+ veiculo.numero +'</td></tr>')[0]);
		tbody.appendChild($('<tr><td class="mapa_percurso_popup_table_label">Operadora</td><td class="mapa_percurso_popup_table_spacer">:</td><td class="mapa_percurso_popup_table_value">'+ veiculo.operadoraShort +'</td></tr>')[0]);

		tbody.appendChild($('<tr><td colspan="3"><div class="mapa_percurso_popup_table_separator"></div></td></tr>')[0]);

		tbody.appendChild($('<tr><td class="mapa_percurso_popup_table_label">Linha</td><td class="mapa_percurso_popup_table_spacer">:</td><td class="mapa_percurso_popup_table_value">'+ veiculo.linha +'</td></tr>')[0]);

		tbody.appendChild($('<tr><td colspan="3"><div class="mapa_percurso_popup_table_separator"></div></td></tr>')[0]);

		tbody.appendChild($('<tr><td colspan="3" class="mapa_percurso_popup_table_title">Localização</td></tr>')[0]);
		//tbody.appendChild($('<tr><td class="mapa_percurso_popup_table_label">Lat</td><td class="mapa_percurso_popup_table_spacer">:</td><td class="mapa_percurso_popup_table_value">'+ lastP.lat +'</td></tr>')[0]);
		//tbody.appendChild($('<tr><td class="mapa_percurso_popup_table_label">Lon</td><td class="mapa_percurso_popup_table_spacer">:</td><td class="mapa_percurso_popup_table_value">'+ lastP.long +'</td></tr>')[0]);
		tbody.appendChild($('<tr><td class="mapa_percurso_popup_table_label">Data</td><td class="mapa_percurso_popup_table_spacer">:</td><td class="mapa_percurso_popup_table_value">'+ formatDate(new Date(veiculo.horario)) +'</td></tr>')[0]);
		tbody.appendChild($('<tr><td class="mapa_percurso_popup_table_label">Horário</td><td class="mapa_percurso_popup_table_spacer">:</td><td class="mapa_percurso_popup_table_value">'+ formatTime(new Date(veiculo.horario)) +'</td></tr>')[0]);
		tbody.appendChild($('<tr><td class="mapa_percurso_popup_table_label">Há</td><td class="mapa_percurso_popup_table_spacer">:</td><td class="mapa_percurso_popup_table_value">'+ formatPastTime(new Date(), new Date(veiculo.horario)) +'</td></tr>')[0]);


		container.appendChild(table);

		return container;
	},
	// Configura o popup para apresentação de horários
	setupHorariosPopup: function(horarios) {
		if (horarios && horarios.length > 0) {
			var self = this;

			sortHorariosParada(horarios);
			self.currentPopupParada.horarios = horarios;
			self.currentPopupParada.horario = findNextHorarioParada(horarios, new Date());

			$('.mapa_percurso_popup_table_row_load').hide();
			$('.mapa_percurso_popup_table_row_info').show();
			$('.mapa_percurso_popup_table_star_desc').show();

			$('.mapa_percurso_popup_table_btn_left').on('click', function() {
				self.backHorarioPopup();
			});
			$('.mapa_percurso_popup_table_btn_right').on('click', function() {
				self.nextHorarioPopup();
			});
		} else {
			$('.mapa_percurso_popup_table_row_load').html('<span style="color: white;">Nenhum horário para o dia corrente.</span>');
			$('.mapa_percurso_popup_table_btn_left, .mapa_percurso_popup_table_btn_left').hide();
		}
	},
	// Avança o horário do popup
	nextHorarioPopup: function() {
		if (this.currentPopupParada.horario) {
			var horarios = this.currentPopupParada.horarios;

			var index = horarios.indexOf(this.currentPopupParada.horario);

			if (index != horarios.length - 1) {
				this.currentPopupParada.horario = horarios[index+1];
			}
		}

		this.updateCurrentHorarioPopup();
	},
	// Retrocede o horário do popup
	backHorarioPopup: function() {
		if (this.currentPopupParada.horario) {
			var horarios = this.currentPopupParada.horarios;
			var index = horarios.indexOf(this.currentPopupParada.horario);

			if (index != 0) {
				this.currentPopupParada.horario = horarios[index-1];
			}
		}

		this.updateCurrentHorarioPopup();
	},
	// Atualiza o corrente popup apresentado
	updateCurrentHorarioPopup: function() {
		var horario = this.currentPopupParada.horario;

		if (horario != undefined) {
			var horarios = this.currentPopupParada.horarios;
			var index = horarios.indexOf(horario);

			$('.mapa_percurso_popup_table_value_operadora').html(horario.operadora);
			$('.mapa_percurso_popup_table_value_viagem > .value').html(horario.horarioParada.substring(0, 5));

			if (index == horarios.length - 1) {
				$('.mapa_percurso_popup_table_btn_right').hide();
			} else {
				$('.mapa_percurso_popup_table_btn_right').show();
			}

			if (index == 0) {
				$('.mapa_percurso_popup_table_btn_left').hide();
			} else {
				$('.mapa_percurso_popup_table_btn_left').show();
			}
		}
	},
	// Cria o popup referente a uma para e linha.
	createPopupParada: function(parada, linha) {
		var container = document.createElement('div');
		container.id = this.popupContainerId;
		container.className = 'mapa_percurso_popup_container';
		
		var table = document.createElement('table');
		table.className = 'mapa_percurso_popup_table';
		var tbody = document.createElement('tbody');
		table.appendChild(tbody);

		tbody.appendChild($('<tr><td colspan="3" class="mapa_percurso_popup_table_title">Parada</td></tr>')[0]);
		tbody.appendChild($('<tr><td class="mapa_percurso_popup_table_label_cod">Código</td><td class="mapa_percurso_popup_table_spacer">:</td><td class="mapa_percurso_popup_table_value_cod">'+ parada.codDftrans +'</td></tr>')[0]);
		tbody.appendChild($('<tr><td colspan="3"><div class="mapa_percurso_popup_table_separator"></div></td></tr>')[0]);
		tbody.appendChild($('<tr><td colspan="3" class="mapa_percurso_popup_table_linha">Linha</td></tr>')[0]);
		tbody.appendChild($('<tr><td class="mapa_percurso_popup_table_label_numero">Número</td><td class="mapa_percurso_popup_table_spacer">:</td><td class="mapa_percurso_popup_table_value_numero">'+ linha.numero +'</td></tr>')[0]);
		tbody.appendChild($('<tr><td class="mapa_percurso_popup_table_label_sentido">Sentido</td><td class="mapa_percurso_popup_table_spacer">:</td><td class="mapa_percurso_popup_table_value_sentido">'+ linha.sentido +'</td></tr>')[0]);
		tbody.appendChild($('<tr class="mapa_percurso_popup_table_row_info"><td colspan="3"><div class="mapa_percurso_popup_table_separator"></div></td></tr>')[0]);
		tbody.appendChild($('<tr class="mapa_percurso_popup_table_row_info">'+
								'<td colspan="3" class="mapa_percurso_popup_table_label_operadora">'+
									'<span class="mapa_percurso_popup_table_btn_left mapa_percurso_popup_table_btn" title="Viagem anterior"><</span>'+
									'Operadora'+
									'<span class="mapa_percurso_popup_table_btn_right mapa_percurso_popup_table_btn" title="Próxima viagem">></span>'+
								'</td>'+
							'</tr>')[0]);
		tbody.appendChild($('<tr class="mapa_percurso_popup_table_row_info"><td class="mapa_percurso_popup_table_value_operadora" colspan="3">Auto Viação São José</td></tr>')[0]);
		tbody.appendChild($('<tr class="mapa_percurso_popup_table_row_info"><td colspan="3" class="mapa_percurso_popup_table_label_viagem">Próxima Viagem</td></tr>')[0]);
		tbody.appendChild($('<tr class="mapa_percurso_popup_table_row_info"><td colspan="3" class="mapa_percurso_popup_table_value_viagem"><span class="value">14:23</span><span style="position: absolute; right: 3px;" class="mapa_percurso_popup_table_star">*</span></td></tr>')[0]);

		tbody.appendChild($('<tr class="mapa_percurso_popup_table_row_load"><td colspan="3">'+
								'<div style="min-height: 80px; padding-top: 10px; text-align: center;">'+
									'<div><img class="loading_animation mapa_percurso_popup_load_img" src="img/load_mini.png" /></div>'+
									'<span>Carregando...</span>'+
								'</div>'+
							'</td></tr>')[0]);

		table.appendChild($('<span class="mapa_percurso_popup_table_star_desc"><span class="mapa_percurso_popup_table_star">*</span> Estimado</span>')[0]);

		container.appendChild(table);

		return container;
	},
	startUpdateVeiculos: function() {
		var self = this;

		if (this.veiculosInterval != undefined) {
			this.stopUpdateVeiculos();
		}

		this.veiculosIntervalCount = 0;
		this.veiculosInterval = setInterval(function() {
			self.updateVeiculosLayer();
		}, 5000);
	},
	stopUpdateVeiculos: function() {
		if (this.veiculosInterval != undefined) {
			clearInterval(this.veiculosInterval);
			this.veiculosInterval = undefined;
			this.veiculosIntervalCount = undefined;
		}
	},
	updateVeiculosLayer: function() {
		if (this.veiculosLayer) {
			$('#mapa_paradas_veiculos_img').addClass('loading_animation');
			$('#mapa_paradas_veiculos_img').addClass('mapa_paradas_veiculos_img_loading');
			
			$('#mapa_paradas_veiculos_img').attr('src', 'img/reload.svg');

			setTimeout(function() {
				$('#mapa_paradas_veiculos_img').removeClass('loading_animation');
				$('#mapa_paradas_veiculos_img').removeClass('mapa_paradas_veiculos_img_loading');

				$('#mapa_paradas_veiculos_img').attr('src', 'img/map-location.svg');
			}, 1000);

			this.veiculosLayer.refresh();
		}

		this.veiculosIntervalCount++;

		if (this.veiculosIntervalCount > 5 && this.veiculosLayer.features && this.veiculosLayer.features.length == 0) {
			this.stopUpdateVeiculos();
		}
	},
	updateVeiculosPanel: function(featuresAdded) {
		var self = this;
		var table = new M.collections.TableCollectionClass();

		table.linhas = featuresAdded.map(function(f) {
			var op = f.attributes.operadora.toUpperCase();

			if (op.indexOf('MARECHAL') != -1) {
				f.attributes.operadoraShort = 'Marechal';
			} else if (op.indexOf('PIRACICABANA') != -1) {
				f.attributes.operadoraShort = 'Piracicabana';
			} else if (op.indexOf('PIONEIRA') != -1) {
				f.attributes.operadoraShort = 'Pioneira';
			} else if (op.indexOf('SÃO JOSÉ') != -1) {
				f.attributes.operadoraShort = 'São José';
			} else if (op.indexOf('URBI') != -1) {
				f.attributes.operadoraShort = 'Urbi';
			} else {
				f.attributes.operadoraShort = '';
			}

			return f.attributes; 
		});
		table.containerId = this.panelVeiculosTableContainerId;
		table.headers = ['Veículo','Operadora'];
		table.tableId = 'tblVeiculos';
		table.tableCellClass = 'lista_table_veiculos_cell';
		table.tableHeaderCellClass = 'lista_table_veiculos_header_cell';
		table.tableHeaderPanelClass = 'display_none';
		table.tableFootPanelClass = 'display_none';
		table.onSelected = function(row) { self.centerVeiculo(row.numero); };
		table.rowValuesSupplier = function(attrs) { return [attrs.numero, attrs.operadoraShort]; };

		table.generate();

		$('#' + this.panelVeiculosTotalFieldId).html(featuresAdded.length);
	},
	_onLayerVeiculosLoadEnd: function(response) {
		if (response.features == undefined || response.features == null || response.features.length == 0) {
			$('#' + this.panelVeiculosTableContainerId).html('');
			$('#' + this.panelVeiculosTotalFieldId).html('nenhum veículo');
		}
	},
	toggleParadasLayerVisibility: function() {
		var visible;

		if (this.paradasLayerVisible == undefined) {
			visible = false;
		} else if (this.paradasLayerVisible == false) {
			visible = true;
		} else {
			visible = false;
		}

		this.setVisibilityParadasLayer(visible);

		return visible;
	},
	setVisibilityParadasLayer: function(visible) {
		this.paradasLayerVisible = visible;
		this.paradasLayer.setVisibility(visible);

		var checkBox = document.getElementById(this.checkboxParadasId);

		if (checkBox != undefined) {
			checkBox.checked = visible;
		}
	},
	centerVeiculo: function(numeroVeiculo) {
		if (this.veiculosLayer && this.veiculosLayer.features != undefined && this.veiculosLayer.features.length > 0) {
			var veiculo = this.veiculosLayer.features.filter(function(f) {
				return f.attributes.numero == numeroVeiculo && f.geometry != undefined && f.geometry != null;
			})[0];

			if (veiculo != undefined) {
				this.map.setCenter(new OpenLayers.LonLat(veiculo.geometry.x, veiculo.geometry.y), 15);
			}
		}
	}
};
var mapaIntegracao = {
	map: undefined,
	mapDivId: 'map_integracao',
	// Inicializa o mapa de integrações
	initMap: function() {
		var map = initMap(this.mapDivId);

		setTimeout(function() {
			map.updateSize();
		}, 100);
		
		this.map = map;
	}
};


// JavaScript Document - Executar quando o documento for aberto.
$(document).ready(function() {
	// Atualiza ano da versão
	document.getElementById('anoVersao').innerHTML = (new Date()).getFullYear();

	// Movimento de swipe sobre o painel diálogo do mapa de paradas
	detectswipe('mapa-parada-legend-btn', function(el, d) {
		if (d == 'r') {
			togglePanelLegendaParada();
		}
	});
	// Movimento de swipe sobre o botão de abertura dp painel diálogo do mapa de paradas
	detectswipe('btnShowPanelLegendaParada', function(el, d) {
		if (d == 'l') {
			togglePanelLegendaParada();
		}
	});
	// Movimento de swipe sobre o painel diálogo do mapa de paradas
	detectswipe('mapa-parada-dialogo', function(el, d) {
		if (d == 'l') {
			toggleMapParadaDialog();
		} else if (d == 'd') { 
			//document.body.scrollTop = 0;
		} else if (d == 'u') {
			document.body.scrollTop = document.body.scrollHeight;
		}
	});
	// Movimento de swipe sobre o botão de abertura dp painel diálogo do mapa de paradas
	detectswipe('btnShowMapDialog', function(el, d) {
		if (d == 'r') {
			toggleMapParadaDialog();
		}
	});
	// Movimento de swipe sobre o painel diálogo do mapa de paradas
	detectswipe('mapa-linha-legend-btn', function(el, d) {
		if (d == 'r') {
			togglePanelLegendaLinha();
		}
	});
	// Movimento de swipe sobre o painel diálogo de veículos do mapa de percurso
	detectswipe('mapa-linha-veiculos-btn', function(el, d) {
		if (d == 'r') {
			togglePanelVeiculos();
		}
	});
	// Movimento de swipe sobre o botão de abertura dp painel diálogo do mapa de paradas
	detectswipe('btnShowPanelLegendaLinha', function(el, d) {
		if (d == 'l') {
			togglePanelLegendaLinha();
		}
	});

	// Voz padrão do speak
	responsiveVoice.setDefaultVoice('Brazilian Portuguese Female');

	// Desativa a funcionalidade de geolocalização caso o site não esteja em https (necessário)
	if (location.protocol != 'https:') {
		isLocationDisabled = true;
		$('.mapa_btn_locate').hide();
	}
	
	if (!responsiveVoice.voiceSupport()) {
		$('.speaker').hide();
	} else {
		function onClickSpeaker(elementId, onClickFunction) {
			$('#' + elementId).on('click', function(e) {
				e.preventDefault();

				var speak = true;
				// Speak speeck se o botão clicando não já estiver ativo
				if ($('.btn_speak_playing').get(0) == e.target) {
					speak = false;
				}

				if (responsiveVoice.isPlaying()) {
					// Speak ativado: desativar speak e remover class ativa dos botões
					speechStop();
				}

				if (speak) {
					// Speak desativado: ativar speak e adicionar class ativa no botão
					$(e.target).addClass('btn_speak_playing');
					onClickFunction();
				}
			});	
		}
		
		onClickSpeaker('btnSpeakLista', speechListagemCurrentLista);
		onClickSpeaker('btnSpeakLinha', speechResumoLinha);
		onClickSpeaker('btnSpeakResumoHorario', speechResumoHorario);
		onClickSpeaker('btnSpeakItinerario', speechItinerario);
		onClickSpeaker('btnSpeakHorarios', speechHorarios);
		onClickSpeaker('btnSpeakResumoItinerario', speechResumoItinerario);
	}
	
	$(window).on('hashchange', function() {
        // On every hash change the render function is called with the new hash.
        // This is how the navigation of our app happens.
        openView(decodeURI(window.location.hash));
    });
	
	// Isola o scroll de uma div do scroll da página.
	$("#info_itinerario").bind("mousewheel DOMMouseScroll", onMouseWheelVerticalScroll);
	$("#info_horario").bind("mousewheel DOMMouseScroll", onMouseWheelVerticalScroll);
	
	// Configura os <select>s de busca de referência
	$('.selectReferencia').select2({
		dropdownCssClass: "form_select_ref_dropdown",
		allowClear: true,
		placeholder: "Ex.: Parque da Cidade",
		ajax: {
			minimumInputLength: 1,
			delay: 500,
			url: function(term) {
				if (term.term) {
					//HTML entity para o caracter '/': &#47;
					term.term = term.term.replace('/', '%26%2347%3B');
				}
				return WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/referencia/find/' + term.term + '/30';
			},
			dataType: 'json',
			type: "GET",
			processResults: function (data) {
				return {					
					results: $.map(data, function(item) {
						if (item.descricao) {	// Remoção do tipo da referência no nome
							var index = item.descricao.indexOf(': ');
							
							if (index != -1) {
								item.descricao = item.descricao.substring(index+2);
							}
						}
						
						return {
							tipo: item.tipo,
							text: item.descricao,
							id: item.sequencialRef
						}
					})
				};
			}
		}
	});
	
	// Tecla ENTER nos campos de input
	$("#inputNumeroLinha, #paradaOrigem, #paradaDestino").on('keyup', function(e) {
		if (e.keyCode == 13) {
			pesquisar();
		}
	});

	// Configura aucomplete do input de linhas
	var delay = (function() {// Delay do aucomplete
		var timer = 0;
		return function(callback, ms) {
			clearTimeout(timer);
			timer = setTimeout(callback, ms);
		};
	})();
	var $dataList = $('#datalistLinha');
	var $input = $('#inputNumeroLinha');
	
	$input.on('keyup', function(e) {
		var valor = this.value;
		
		if (valor.length > 0) {
			delay(function() {
				pesquisaLinhasLike(valor, function(linhas) {
					$dataList.empty();
					
					if (linhas && linhas.length > 0) {
						linhas.forEach(function(linha) {
							var option = document.createElement('option');
							option.value = linha.numero;
							option.text = linha.descricao;
							$dataList.append(option);
						});
					}
				});
			}, 500);
		}
	});

	var hash = window.location.hash;

	if (hash) {
		render('');	// Carrega view inicial e em seguida a indicada pelo hash
		setTimeout(function() {
			render(hash);	
		}, 500);
		
	} else {
		$(window).trigger('hashchange');
	}
	
	$('#top_btn_voltar').on('click', onClickBtnVoltar);

	// Evento de click sobre a barra de notificação; esconder barra
	$('#'+M.messages.barId).on('click', M.messages.hide);
	
	// Verifica se o navegador dá suporte a reconhecimento de voz.
	window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
	if (window.SpeechRecognition === null) {
		$('#menuTabSpeech').hide();
		$('.form_menu > .form_menu_tab').not(':hidden').last().addClass('form_menu_tab_last');
	}

	// Esconde caixa de diálogo lateral do mapa de paradas com slide
    $('#mapa-parada-dialogo').on("swipe",function() {
  		$(this).hide();
	});

    // GeoLocalização não suportada
	if (!navigator.geolocation) {
		$('.mapa_btn_locate').hide();
	}

	// Pesquisa a data da última carga de dados realizada
	pesquisarUltimaCarga(function(data) {
		if (data && data.data) {
			var date = new Date(data.data);

			$('#panelDataAtualizacao').show();
			$('#panelDataAtualizacao > .data_field').html(formatDateAndTime(date));
		}
	});

});

// Alterar o url para uma nova página
function render(url) {
	window.location.hash = url;
	
	$('body').attr('data-atualizacao', 'Data da consulta: ' + formatDateAndTime(new Date()));
}

// Exibe uma subpágina em específico de acordo com #hash da url
function openView(url) {
	var queryParams = undefined;

	if (url.indexOf('?') != -1) {
		var split = url.split('?');

		url = split[0];
		queryParams = parseQueryParams(split[1]);
	}

	$('#containerInicio, #containerLinhas, #containerInfo, #containerContato, #containerIntegracoes, #containerIntegracaoInfo').hide();
	var view = M.views[url];

	if (view) {
		view.show(undefined, queryParams);
		enableBtnVoltar(view.hash != '');
	} else {
		// Não reconhecida
		openView('');
	}
}


/*** UTILITÁRIOS GENÉRICOS ***/

function checkIfMobile() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
}

// Verifica se uma valor é um número
function isNumber(o) {
	return ! isNaN (o-0) && o !== null && o !== "" && o !== false;
}

// Desliza a tela até um elemento.
function scrollTo(elementId) {
	var $element = $('#' + elementId);
	
	if ($element.length > 0) {
		$('html, body').animate({
			scrollTop: $element.offset().top
		}, 500);
	}
}

// Obtem somente o path de uma url: (www.site.com)/trash/trash.html
function filterPath(string) {
	return string.replace(/^\//,'').replace(/(index|default).[a-zA-Z]{3,4}$/,'').replace(/\/$/,'');
}

// Define o controle abrir/fechar das árvores de listas
function treeToggleControl(divId) {
	// Para todos os <a>'s dentro de <li>'s dentro de uma certa div, define-se o evento de click...
	$('#'+ divId +' li a').click(function() {
		var nextUl = $(this).next('ul');	//Obtem a <ul> seguinte ao <a>

		// Caso exista conteudo
		if (nextUl) {
			// Alterna a visibilidade da <ul>
			nextUl.toggle();
		}

		return false;
	});
}

// Atente ao evento de scroll horizontal
function onMouseWheelHorizontalScroll(e) {
	if (e.currentTarget.offsetHeight < e.currentTarget.scrollHeight || e.currentTarget.offsetWidth < e.currentTarget.scrollWidth) {	
		e = e.originalEvent;
		var delta = e.wheelDelta>0 || e.detail<0?1:-1;
		
		this.scrollLeft -= (delta * 90);
		e.preventDefault();
	}
}

// Atente ao evento de scroll vertical
function onMouseWheelVerticalScroll(e) {
	if (e.currentTarget.offsetHeight < e.currentTarget.scrollHeight || e.currentTarget.offsetWidth < e.currentTarget.scrollWidth) {	
		var e0 = e.originalEvent;
		var delta = e0.wheelDelta || -e0.detail;

		this.scrollTop += ( delta < 0 ? 1 : -1 ) * 90;
		e.preventDefault();
	}
}

// Verifica se o browser é o Internet Explorer
function isMsIEversion() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    return (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./));

    return false;
}

// Verifica se um dado elemento se encontra em overflow
function isOverflow(el) {
   var curOverflow = el.style.overflow;

   if ( !curOverflow || curOverflow === "visible" )
      el.style.overflow = "hidden";

   var isOverflowing = el.clientWidth < el.scrollWidth 
      || el.clientHeight < el.scrollHeight;

   el.style.overflow = curOverflow;

   return isOverflowing;
}

// Realiza o parse de query parameters.
function parseQueryParams(queryStr) {
  var query;
  if(queryStr) {
    var pos = queryStr.indexOf('?');
    if (pos != -1) {
		query = queryStr.substr(pos+1);
	} else {
		query = queryStr;
	}
  } else {
    return [];
  }
  var result = {};
  query.split("&").forEach(function(part) {
    if(!part) return;
    part = part.split("+").join(" ");
    var eq = part.indexOf("=");
    var key = eq>-1 ? part.substr(0,eq) : part;
    var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
    var from = key.indexOf("[");
    if(from==-1) result[decodeURIComponent(key)] = val;
    else {
      var to = key.indexOf("]",from);
      var index = decodeURIComponent(key.substring(from+1,to));
      key = decodeURIComponent(key.substring(0,from));
      if(!result[key]) result[key] = [];
      if(!index) result[key].push(val);
      else result[key][index] = val;
    }
  });
  return result;
}

// Obtem as propriedades de um objeto em query string
function toQueryString(obj) {
	var str = [];

	for (var p in obj) {
		if (obj.hasOwnProperty(p)) {
			str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
		}
	}

	return str.join("&");
}

// Produz uma string randômica de um deter
function generateRandomStr(length) {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < length; i++) 
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

// Remove um elemento com a partir do seu parentNode
function removeElement(elem) {
	elem.parentNode.removeChild(elem);
}

// Obtem uma propriedade dentro de um objeto em profundidade
function fetchFromObject(obj, prop) {
    if (typeof obj === 'undefined' || typeof prop === 'undefined') {
        return false;
    }

    if (obj == null) {
    	return false;
    }

    var _index = prop.indexOf('.')
    if (_index > -1) {
        return fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index + 1));
    }

    return obj[prop];
}

// Obtem o conteúdo de um elemento em texto.
function getText(elementId) {
	var str = document.getElementById(elementId).innerHTML;
	
	if (str) {
		str = str.trim();
	} else {
		str = '';
	}
	
	return str;
}

// Detecta o movimento de swipe sobre um elemento
function detectswipe(el,func) {
	swipe_det = new Object();
	swipe_det.sX = 0;
	swipe_det.sY = 0;
	swipe_det.eX = 0;
	swipe_det.eY = 0;
	var min_x = 20;  //min x swipe for horizontal swipe
	var max_x = 40;  //max x difference for vertical swipe
	var min_y = 40;  //min y swipe for vertical swipe
	var max_y = 50;  //max y difference for horizontal swipe
	var direc = "";

	ele = document.getElementById(el);
	ele.addEventListener('touchstart',function(e) {
		var t = e.touches[0];
		swipe_det.sX = t.screenX; 
		swipe_det.sY = t.screenY;
	},false);

	ele.addEventListener('touchmove',function(e) {
		e.preventDefault();
		var t = e.touches[0];
		swipe_det.eX = t.screenX; 
		swipe_det.eY = t.screenY;    
	},false);

	ele.addEventListener('touchend',function(e) {
		//horizontal detection
		if ((((swipe_det.eX - min_x > swipe_det.sX) || (swipe_det.eX + min_x < swipe_det.sX)) && ((swipe_det.eY < swipe_det.sY + max_y) && (swipe_det.sY > swipe_det.eY - max_y)))) {
		  	if(swipe_det.eX > swipe_det.sX) direc = "r";
	  		else direc = "l";
		}

		//vertical detection
		if ((((swipe_det.eY - min_y > swipe_det.sY) || (swipe_det.eY + min_y < swipe_det.sY)) && ((swipe_det.eX < swipe_det.sX + max_x) && (swipe_det.sX > swipe_det.eX - max_x)))) {
  			if(swipe_det.eY > swipe_det.sY) direc = "d";
  			else direc = "u";
		}

		if (direc != "") {
  			if(typeof func == 'function') func(el,direc);
		}
		direc = "";
	}, false);  
}

// Configura um valor para uma coleção de radio buttons.
function setRadioGroupValue(radiosCollection, value) {
	for (var i = 0; i < radiosCollection.length; i++) {
		radiosCollection[i].checked = (radiosCollection[i].value == value);
	}
}

// Obtem o valor de um grupo de radio buttons
function getRadioGroupValue(radiosCollection) {
	var value = undefined;

	for (var i = 0; i < radiosCollection.length; i++) {
		if (radiosCollection[i].checked) {
			value = radiosCollection[i].value;
			break;
		}
	}

	return value;
}

// Obtem a string que representa um objeto Date fornecendo dia, mês, ano, hora e minuto
function formatDateAndTime(data) {
	var dia = data.getDate();

	if (dia < 10) {
		dia = '0' + String(dia);
	}

	var mes = data.getMonth() + 1;

	if (mes < 10) {
		mes = '0' + String(mes);
	}

	var hour = data.getHours();

	if (hour < 10) {
		hour = '0' + String(hour);
	}

	var minute = data.getMinutes();

	if (minute < 10) {
		minute = '0' + String(minute);
	}

	return dia + '/' + mes + '/' + data.getFullYear() + ' - ' + hour + ':' + minute;
}

// Retorna a data de um date em string
function formatDate(date) {
	var day = date.getDate();

	if (day < 10) {
		day = '0' + day;
	} else {
		day = String(day);
	}

	var month = date.getMonth() + 1;

	if (month < 10) {
		month = '0' + month;
	} else {
		month = String(month);
	}

	var year = date.getFullYear();

	return day + '/' + month + '/' + year;
}

// Retorna o horário de um date em string
function formatTime(date) {
	var hours = date.getHours();

	if (hours < 10) {
		hours = '0' + hours;
	} else {
		hours = String(hours);
	}

	var minutes = date.getMinutes();

	if (minutes < 10) {
		minutes = '0' + minutes;
	} else {
		minutes = String(minutes);
	}

	var seconds = date.getSeconds();

	if (seconds < 10) {
		seconds = '0' + seconds;
	} else {
		seconds = String(seconds);
	}

	return hours + ':' + minutes + ':' + seconds;
}

// Retorna o tempo decorrido entre duas datas
function formatPastTime(date1, date2) {
	function sec(secs, mins) {
		if (mins != undefined) {
			secs = secs - (60 * mins);
		}

		return secs == 0 ? '' : secs + 'sec';
	}

	function min(mins, hours) {
		if (hours != undefined) {
			mins = mins - (60 * hours);
		}

		return mins == 0 ? '' : mins + 'min';
	}

	var difTime = Math.abs(date1.getTime() - date2.getTime());

	var seconds = parseInt(difTime / 1000);

	if (seconds < 60) {
		return sec(seconds);
	}

	if (seconds == 60) {
		return '1min';
	}

	var minutes = parseInt(seconds / 60);

	if (minutes < 60) {
		return min(minutes) +' '+ sec(seconds, minutes);
	}

	if (minutes == 60) {
		return '1h';
	}

	var hours = parseInt(minutes / 60);

	return hours + 'h' +' '+ min(minutes, hours) + ' '+ sec(seconds, minutes);
}


// Interface com o Google Analytics
M.analytics = {
	enable: ANALYTICS_ENABLE,
	// Envia um evento de pesquisa
	submitPesquisaEvent: function(search, evento, pesquisaSucceed) {
		if (this.enable) {
			/*gtag('event', evento, {
			  'event_category': 'Pesquisa',
			  'event_label': search,
			  'pesquisa_succeed': pesquisaSucceed
			});*/
		}
	},
	// Envia um evento de pesquisa por URL
	submitPesquisaByURLEvent: function(search, evento, pesquisaSucceed) {
		if (this.enable) {
			/*gtag('event', evento, {
			  'event_category': 'PesquisaByURL',
			  'event_label': search,
			  'pesquisa_succeed': pesquisaSucceed
			});*/
		}
	},
	// Submete o evento de pesquisa de cidade
	submitPesquisaCidade: function(origem, destino) {
		this.submitPesquisaEvent('origem:' + origem +',destino:' + destino, 'linhasByCidade', 'true');
	},
	// Submete o evento de pesquisa por parada
	submitPesquisaParada: function(origem, destino) {
		this.submitPesquisaEvent('origem:' + origem +',destino:' + destino, 'linhasByParada', 'true');
	},
	// Submete o evento de pesquisa por linha número
	submitPesquisaLinhaByNumero: function(numero, succeed) {
		this.submitPesquisaEvent(numero, 'linhaByNumero', succeed ? 'true' : 'false');
	},
	// Submete o evento de pesquisa por linha descrição
	submitPesquisaLinhaByDesc: function(numero, succeed) {
		this.submitPesquisaEvent(numero, 'linhaByDesc', succeed ? 'true' : 'false');
	},
	// Submete o evento de pesquisa por linhas por referência
	submitPesquisaReferencia: function(origem, destino) {
		this.submitPesquisaEvent('origem:' + origem.tipo+'-'+origem.id + ',destino:' + destino.tipo+'-'+destino.id, 'linhasByRef', 'true');
	},
	// Submete o evento de pesquisa por código de parada
	submitPesquisaCodParada: function(codigoParada) {
		this.submitPesquisaByURLEvent(codigoParada, 'linhasByCodigoParada', 'true');
	},
	submitPesquisaCodEstacao: function(codigoEstacao) {
		this.submitPesquisaByURLEvent(codigoEstacao, 'linhasByCodigoEstacao', 'true');	
	}
};

// Remoção de acentuação
M.diacritics = {
	// Mapa de caracteres acentuados e seus respectivos não-acentuados
	defaultDiacriticsRemovalMap: [
        {'base':'A', 'letters':'\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F'},
        {'base':'AA','letters':'\uA732'},
        {'base':'AE','letters':'\u00C6\u01FC\u01E2'},
        {'base':'AO','letters':'\uA734'},
        {'base':'AU','letters':'\uA736'},
        {'base':'AV','letters':'\uA738\uA73A'},
        {'base':'AY','letters':'\uA73C'},
        {'base':'B', 'letters':'\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181'},
        {'base':'C', 'letters':'\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E'},
        {'base':'D', 'letters':'\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779\u00D0'},
        {'base':'DZ','letters':'\u01F1\u01C4'},
        {'base':'Dz','letters':'\u01F2\u01C5'},
        {'base':'E', 'letters':'\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E'},
        {'base':'F', 'letters':'\u0046\u24BB\uFF26\u1E1E\u0191\uA77B'},
        {'base':'G', 'letters':'\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E'},
        {'base':'H', 'letters':'\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D'},
        {'base':'I', 'letters':'\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197'},
        {'base':'J', 'letters':'\u004A\u24BF\uFF2A\u0134\u0248'},
        {'base':'K', 'letters':'\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2'},
        {'base':'L', 'letters':'\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780'},
        {'base':'LJ','letters':'\u01C7'},
        {'base':'Lj','letters':'\u01C8'},
        {'base':'M', 'letters':'\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C'},
        {'base':'N', 'letters':'\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4'},
        {'base':'NJ','letters':'\u01CA'},
        {'base':'Nj','letters':'\u01CB'},
        {'base':'O', 'letters':'\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C'},
        {'base':'OI','letters':'\u01A2'},
        {'base':'OO','letters':'\uA74E'},
        {'base':'OU','letters':'\u0222'},
        {'base':'OE','letters':'\u008C\u0152'},
        {'base':'oe','letters':'\u009C\u0153'},
        {'base':'P', 'letters':'\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754'},
        {'base':'Q', 'letters':'\u0051\u24C6\uFF31\uA756\uA758\u024A'},
        {'base':'R', 'letters':'\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782'},
        {'base':'S', 'letters':'\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784'},
        {'base':'T', 'letters':'\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786'},
        {'base':'TZ','letters':'\uA728'},
        {'base':'U', 'letters':'\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244'},
        {'base':'V', 'letters':'\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245'},
        {'base':'VY','letters':'\uA760'},
        {'base':'W', 'letters':'\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72'},
        {'base':'X', 'letters':'\u0058\u24CD\uFF38\u1E8A\u1E8C'},
        {'base':'Y', 'letters':'\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE'},
        {'base':'Z', 'letters':'\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762'},
        {'base':'a', 'letters':'\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250'},
        {'base':'aa','letters':'\uA733'},
        {'base':'ae','letters':'\u00E6\u01FD\u01E3'},
        {'base':'ao','letters':'\uA735'},
        {'base':'au','letters':'\uA737'},
        {'base':'av','letters':'\uA739\uA73B'},
        {'base':'ay','letters':'\uA73D'},
        {'base':'b', 'letters':'\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253'},
        {'base':'c', 'letters':'\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184'},
        {'base':'d', 'letters':'\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A'},
        {'base':'dz','letters':'\u01F3\u01C6'},
        {'base':'e', 'letters':'\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD'},
        {'base':'f', 'letters':'\u0066\u24D5\uFF46\u1E1F\u0192\uA77C'},
        {'base':'g', 'letters':'\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F'},
        {'base':'h', 'letters':'\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265'},
        {'base':'hv','letters':'\u0195'},
        {'base':'i', 'letters':'\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131'},
        {'base':'j', 'letters':'\u006A\u24D9\uFF4A\u0135\u01F0\u0249'},
        {'base':'k', 'letters':'\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3'},
        {'base':'l', 'letters':'\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747'},
        {'base':'lj','letters':'\u01C9'},
        {'base':'m', 'letters':'\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F'},
        {'base':'n', 'letters':'\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5'},
        {'base':'nj','letters':'\u01CC'},
        {'base':'o', 'letters':'\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275'},
        {'base':'oi','letters':'\u01A3'},
        {'base':'ou','letters':'\u0223'},
        {'base':'oo','letters':'\uA74F'},
        {'base':'p','letters':'\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755'},
        {'base':'q','letters':'\u0071\u24E0\uFF51\u024B\uA757\uA759'},
        {'base':'r','letters':'\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783'},
        {'base':'s','letters':'\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B'},
        {'base':'t','letters':'\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787'},
        {'base':'tz','letters':'\uA729'},
        {'base':'u','letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289'},
        {'base':'v','letters':'\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C'},
        {'base':'vy','letters':'\uA761'},
        {'base':'w','letters':'\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73'},
        {'base':'x','letters':'\u0078\u24E7\uFF58\u1E8B\u1E8D'},
        {'base':'y','letters':'\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF'},
        {'base':'z','letters':'\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763'}
    ],

	// Remove acentuação de caracteres
	removeDiacritics: function(str) {
		if (typeof variable === 'undefined') {
			diacriticsMap = {};
			for (var i=0; i < this.defaultDiacriticsRemovalMap .length; i++){
				var letters = this.defaultDiacriticsRemovalMap [i].letters;
				for (var j=0; j < letters.length ; j++){
					diacriticsMap[letters[j]] = this.defaultDiacriticsRemovalMap [i].base;
				}
			}
		}
		
		return str.replace(/[^\u0000-\u007E]/g, function(a){ 
		   return diacriticsMap[a] || a; 
		});
	}
};

// Controla animações de carregamento da página.
M.loading = {
	showTop: function() {
		this.show('top_loading');
	},
	hideTop: function() {
		this.hide('top_loading');
	},
	showLinha: function() {
		this.show('linhaResumoLoading');
	},
	hideLinha: function() {
		this.hide('linhaResumoLoading');
	},
	showItinerario: function() {
		this.show('itinerarioLoading');
		this.show('itinerarioResumoLoading');
	},
	hideItinerario: function() {
		this.hide('itinerarioLoading');
		this.hide('itinerarioResumoLoading');
	},
	showHorario: function() {
		this.show('horarioLoading');
		this.show('horarioResumoLoading');
	},
	hideHorario: function() {
		this.hide('horarioLoading');
		this.hide('horarioResumoLoading');
	},
	showLista: function() {
		this.show('listaLoading');
	},
	hideLista: function() {
		this.hide('listaLoading');
	},
	show: function(elemId) {
		$('#'+elemId).fadeIn();
		//display_div('top_loading', 'block');
	},
	hide: function(elemId) {
		$('#'+elemId).fadeOut();
		//display_div('top_loading', 'none');
	}
};

// Controla exibição de mensagens
M.messages = {
	// ID do elemento notification bar
	barId: 'notification-bar',
	// Time out da animação slideUp
	slideUpTimeout: undefined,
	// Mostra uma mensagem com estilizada por uma classe css
	showMsgClass: function(msg, className) {
		var div = document.createElement('div');
		div.className = className;
		div.innerHTML = msg;
		this.showMsg(div);

		if (this.speak) {
			if (msg.startsWith('<')) {
				msg = msg.substring(3);
			}
			this.speak(msg);
		}
	},
	// Mostra uma mensagem de error
	showError: function(msg) {
		this.showMsgClass(msg, 'notification_error');
	},
	// Mostra uma mensagem de atenção
	showWarn: function(msg) {
		this.showMsgClass(msg, 'notification_warn');
	},
	// Mostra uma mensagem informativa
	showInfo: function(msg) {
		this.showMsgClass(msg, 'notification_info');
	},
	// Mostra uma mensagem no início da página
	showMsg: function(message, duration) {
		var self = this;

		duration = typeof duration !== 'undefined' ? duration : 3000;

		var $bar = $('#'+this.barId);
		$bar.empty();
		$bar.append(message);

		// Obs.: configura o min-height para 0 só enquanto a animação ocorre; workaround necessário
		var minHeight = $bar.css('min-height');
		$bar.css('min-height', 0);

		$bar.slideDown(function() {
			$bar.css('min-height', minHeight);

			self.slideUpTimeout = setTimeout(self.slideUpBar, duration);
		});
	},
	// Realiza o slideUp
	slideUpBar: function() {
		var $bar = $('#'+M.messages.barId);

		var minHeight = $bar.css('min-height');

		$bar.css('min-height', 0);

		$bar.slideUp(function() {
			$bar.css('min-height', minHeight);
		});
	},
	// Esconde a barra de notificação
	hide: function() {
		clearTimeout(this.slideUpTimeout);
		M.messages.slideUpBar();
	}
};

// Responde aos comandos das diferentes telas.
M.voicecontroller = (function() {
	function VoiceController() {}
	VoiceController.prototype.onResult = function(transcription, confidence) {
		transcription = transcription.toLowerCase().trim();
		
		console.log(transcription);
		
		if (transcription.startsWith('origem') && transcription.indexOf('destino') != -1) {
			transcription = transcription.replace('origem', '');

			var index = transcription.indexOf('destino');

			var origem = transcription.substring(0, index).trim();
			var destino = transcription.substring(index + 'destino'.length).trim();

			if (origem && destino) {
				pesquisaReferenciasLike(origem, function(refs) {
					if (refs && refs.length > 0) {
						var refOrigem = refs[0];

						pesquisaReferenciasLike(destino, function(refss) {
							if (refss && refss.length > 0) {
								var refDestino = refss[0];
								
								function removeRa(ref) {
									if (ref.descricao.startsWith('RA : ')) {
										ref.descricao = ref.descricao.replace('RA : ', '');
									}
								}
								
								removeRa(refOrigem);
								removeRa(refDestino);
								
								speech('Pesquisando linhas de ' + refOrigem.descricao + ' para ' + refDestino.descricao);
								
								setTimeout(function() {
									isSpeech = true;
									pesquisarFormRef(refOrigem, refDestino);
								}, 5000);
							} else {
								M.messages.showWarn('Nenhuma referência para a destino: ' + destino);
							}
						});
					} else {
						M.messages.showWarn('Nenhuma referência para a origem: ' +  origem);
					}
				});
			} else {
				M.messages.showWarn('Referências nulas informadas.');
			}
		} else if (transcription.startsWith('linha')) {
			transcription = transcription.replace('linha', '').trim();

			if (transcription.length > 0) {
				var texto = 'Pesquisando linha número ' + transcription + '. ';

				speech(texto);
				
				setTimeout(function() {
					pesquisarFormLinha(transcription);
				}, 4000);
			}
		} else if (transcription.indexOf('ok') != -1) {
			speechStop();
		} else if (transcription.startsWith('voltar')) {
			speechStop();
			onClickBtnVoltar();
		} else if (transcription.indexOf('desligar') != -1 || transcription.indexOf('até mais') != -1) {
			speech('Até mais.', function() {
				recognizer.stop();
			});
		}
	};
	
	
	function PesquisaVoiceController() {
		VoiceController.call(this);
	}
	PesquisaVoiceController.prototype = Object.create(VoiceController.prototype);
	PesquisaVoiceController.prototype.constructor = PesquisaVoiceController;
	PesquisaVoiceController.prototype.onResult = function(transcription, confidence) {
		transcription = transcription.toLowerCase().trim();
		Object.getPrototypeOf(PesquisaVoiceController.prototype).onResult.call(this, transcription, confidence);
		
		if (transcription.startsWith('ajuda') || transcription.startsWith('help')) {
			speechPesquisaComando();
		}
	};
	
	
	function ListaVoiceController() {
		VoiceController.call(this);
	}
	ListaVoiceController.prototype = Object.create(VoiceController.prototype);
	ListaVoiceController.prototype.constructor = ListaVoiceController;
	ListaVoiceController.prototype.onResult = function(transcription, confidence) {
		transcription = transcription.toLowerCase().trim();
		Object.getPrototypeOf(ListaVoiceController.prototype).onResult.call(this, transcription, confidence);
		
		if (transcription.startsWith('listagem')) {
			speechListagemCurrentLista();
		} else if (transcription.startsWith('filtrar por')) {
			transcription = transcription.replace('filtrar por', '').trim();

			var texto = 'Filtrando por ' + transcription + '. ';

			speech(texto);
			
			setTimeout(function() {
				filtrarListaLinhas(transcription);
				speechListaLinhasQuantidade();
			}, 5000);
		} else if (transcription.startsWith('ajuda') || transcription.startsWith('help')) {
			speechListaLinhasComando();
		} else if (transcription.startsWith('quantidade')) {
			speechListaLinhasQuantidade();
		}
	};
	
	
	function LinhaVoiceController() {
		VoiceController.call(this);
	}
	LinhaVoiceController.prototype = Object.create(VoiceController.prototype);
	LinhaVoiceController.prototype.constructor = LinhaVoiceController;
	LinhaVoiceController.prototype.onResult = function(transcription, confidence) {
		transcription = transcription.toLowerCase().trim();
		Object.getPrototypeOf(LinhaVoiceController.prototype).onResult.call(this, transcription, confidence);
				
		if (transcription.startsWith('resumo horário')) {
			speechResumoHorario();
		} else if (transcription.startsWith('resumo itinerário')) {
			speechResumoItinerario();
		} else if (transcription.startsWith('resumo')) {
			speechResumoLinha();
		} else if (transcription.startsWith('horário')) {
			transcription = transcription.replace('horário', '').trim().toUpperCase();
		
			var diaSemana = undefined;
			
			if (DIAS_SEMANA.indexOf(transcription) != -1) {
				diaSemana = transcription;
			}
			
			speechHorarios(diaSemana);
		} else if (transcription.startsWith('itinerário')) {
			speechItinerario();
		} else if (transcription.startsWith('sentido')) {
			var sentido = transcription.replace('sentido', '').trim().toUpperCase();
			
			if (SENTIDOS.indexOf(sentido) != -1) {
				if (linhaPesquisada.linha.sentido == 'CIRCULAR') {
					speech('Linha de sentido CIRCULAR.');
				} else {
					if (linhaPesquisada.linha.sentido == sentido) {
						speech('Sentido ' + sentido + ' já definido.');
					} else {
						speech('Sentido ' + sentido + ' definido.');
						setCurrentSentidoAs(sentido);
					}
				} 
			}
		} else if (transcription.startsWith('ajuda') || transcription.startsWith('help')) {
			speechLinhaComando();
		}
	};
	
	
	return {
		'': new PesquisaVoiceController(),
		'#linhas': new ListaVoiceController(),
		'#linha': new LinhaVoiceController()
	};
})();

// Retem as views do site
M.views = (function() {
	// Representa uma page do site
	function View(id) {
		this.id = id;
		this.hash = '';
	}
	View.prototype.processParams = function(queryParams) {};//a ser sobrescrito
	View.prototype.show = function(callBack, queryParams) {
		if (queryParams) {
			this.processParams(queryParams);
		}
		$('#'+this.id).fadeIn('fast', callBack);
	};
	View.prototype.hide = function(callBack) {
		$('#'+this.id).fadeOut('fast', callBack);
	};


	function ViewPesquisa() {
		View.call(this, 'containerInicio');
		this.hash = '';
	}
	ViewPesquisa.prototype = Object.create(View.prototype);
	ViewPesquisa.prototype.constructor = ViewPesquisa;
	ViewPesquisa.prototype.hide = function(callBack) {
		Object.getPrototypeOf(ViewPesquisa.prototype).show.call(this, callBack);

		$('#btnContato').fadeOut('fast');
		$('#labelVersao').fadeOut('fast');
		$('#btnOnlineMarker').fadeOut('fast');
	};


	
	// Subclass da view da lista de linhas
	function ViewLinhas() {
		View.call(this, 'containerLinhas');
		this.hash = '#linhas';
	}
	ViewLinhas.prototype = Object.create(View.prototype);
	ViewLinhas.prototype.constructor = ViewLinhas;
	// Processos os parâmetros passados para a view linhas
	ViewLinhas.prototype.processParams = function(queryParams) {
		if (QUERY_PARAM_COD_PARADA in queryParams || QUERY_PARAM_SEQ_ESTACAO in queryParams) {
			function hideLoading() {
				M.loading.hideTop();
				M.loading.hideLista();
			}
			
			M.loading.showTop();
			M.loading.showLista();

				
			if (QUERY_PARAM_COD_PARADA in queryParams) {	// Listagem das linhas de uma parada
				pesquisarParadaByCod(queryParams.codParada, function(parada) {
					if (parada && parada.codParada) {
						setListaLinhasTitulo('Parada ' + parada.codParada);
					}
				}, function() {
					pesquisaLinhasByCodParada(queryParams.codParada, function(linhas) {

						M.analytics.submitPesquisaCodParada(queryParams.codParada, true);

						setListaLinhas(linhas);
					}, hideLoading);
				});
			} else {	// Listagem das linhas de uma estação				
				pesquisarEstacao(queryParams.seqEstacao, function(estacao) {
					if (estacao && estacao.descricao) {
						setListaLinhasTitulo(estacao.descricao);
					}
				}, function() {
					pesquisaLinhasBySeqEstacao(queryParams.seqEstacao, function(linhas) {

							M.analytics.submitPesquisaCodEstacao(queryParams.seqEstacao, true);

							setListaLinhas(linhas);
					}, hideLoading);
				});
			}
		}
	};


	// Subclass da view da seleção de uma integração
	function ViewIntegracoes() {
		View.call(this, 'containerIntegracoes');
		this.hash = '#integracoes';
	}
	ViewIntegracoes.prototype = Object.create(View.prototype);
	ViewIntegracoes.prototype.constructor = ViewIntegracoes;
	// Processos os parâmetros passados para a view integrações
	ViewIntegracoes.prototype.processParams = function(queryParams) {
		var params = ['origem','destino','origemId', 'destinoId'];

		if (params.filter(function(param) {return param in queryParams;}).length == params.length) {
			M.integracao2.load( {tipo: queryParams['origem'], id: queryParams['origemId']},
								{tipo: queryParams['destino'], id: queryParams['destinoId']} );
		}
	};


	// Subclass da view para apresentação de um integração
	function ViewIntegracao() {
		View.call(this, 'containerIntegracaoInfo');
		this.hash = '#integracao';
	}
	ViewIntegracao.prototype = Object.create(View.prototype);
	ViewIntegracao.prototype.constructor = ViewIntegracao;

	
	// Subclass da view de linha
	function ViewLinha() {
		View.call(this, 'containerInfo');
		this.hash = '#linha';
	}
	ViewLinha.prototype = Object.create(View.prototype);
	ViewLinha.prototype.constructor = ViewLinha;
	// Processos os parâmetros passados para a view linha
	ViewLinha.prototype.processParams = function(queryParams) {
		if (QUERY_PARAM_NUM_LINHA in queryParams) {	// Visualização dos dados de uma linha
			M.loading.showTop();
			M.loading.showLinha();
			
			pesquisaLinhaByNumero(queryParams.numeroLinha, function(data) {
				if (data && data.length > 0) {
					setLinhas(data);
					pesquisaItinerario();
					pesquisaHorarios();
				} else {
					console.log('<-> linha não encontrada: ' + queryParams.numeroLinha);
					M.messages.showInfo('<-> linha não encontrada.');
				}
			}, function() {
				M.loading.hideTop();
				M.loading.hideLinha();
			});
		}
	};


	// Subclass da view de contato
	function ViewContato() {
		View.call(this, 'containerContato');
		this.hash = '#contato';
	}
	ViewContato.prototype = Object.create(View.prototype);
	ViewContato.prototype.constructor = ViewContato;

	
	// Views exportadas
	return {
		//'': new View('containerInicio'),
		'': new ViewPesquisa(),
		'#linhas': new ViewLinhas(),
		'#linha': new ViewLinha(),
		'#contato': new ViewContato(),
		'#integracoes': new ViewIntegracoes(),
		'#integracao': new ViewIntegracao()
	};
})();

// Tabelas Genéricas
M.collections = (function() {

	// Table abstrata de linhas
	function AbstractCollection() {
		this.containerId = '';
		this.linhas = [];
		this.linhasCurrent = [];
		this.propertieId = '_generatedId';
		this.defaultPropertieFilter = undefined;
	}
	// Ordena as linhas por uma propriedade (ex.: numero; faixaTarifaria.tarifa)
	AbstractCollection.prototype.orderBy = function(field) {
		this.linhas.sort(function(linhaA, linhaB) {
			var valueA = fetchFromObject(linhaA, field);
			var valueB = fetchFromObject(linhaB, field);
			
			if (valueA) {
				if (valueB) {
					valueA = valueA.toString();
					valueB = valueB.toString();
					
					return valueA.toUpperCase().localeCompare(valueB.toUpperCase());
				} else {
					return -1
				}
			} else {
				return 1;
			}
		});
		this.generate();
	};
	// Deve corresponder ao código de geração da lista
	AbstractCollection.prototype.generate = function() {
		$('#'+this.containerId).empty();
	};
	// Responde ao evento de filtro
	AbstractCollection.prototype.onFilter = function(value, propertie) {
		if (propertie == undefined) {
			propertie = this.defaultPropertieFilter;
		}

		value = /*M.diacritics.removeDiacritics(*/value.toLowerCase();

		var bloco, display, listaLinhas = this.linhas;

		this.linhasCurrent = [];

		for (var i = 0; i < listaLinhas.length; i++) {
			bloco = document.getElementById(listaLinhas[i][this.propertieId]);
			
			if (bloco) {
				if (value.length == 0 || this.filterMatchFunction(value, listaLinhas[i], propertie)) {
					this.linhasCurrent.push(listaLinhas[i]);

					display = bloco.getAttribute('data-display');
					bloco.style.display = (display) ? display : 'block';
				} else {
					bloco.style.display = 'none';
				}
			}
		}
		
		if (value.length == 0) {
			this.onFilterClear();
		}

		this.onFilterDone(this.linhasCurrent);
	};
	// Responde ao evento quando o filtro é limpo
	AbstractCollection.prototype.onFilterClear = function() {};
	// Responde ao evento de seleção de uma linha
	AbstractCollection.prototype.onSelected = function(linha) {};
	// Configura as linhas da tabela
	AbstractCollection.prototype.setLinhas = function(linhas) {
		this.linhas = linhas;
		this.linhasCurrent = linhas.map(function(l){return l;});
	};
	// Configura o ID do container
	AbstractCollection.prototype.setContainerId = function(containerId) { this.containerId = containerId; };
	// Configura a propriedade que identifica unicamento uma linha
	AbstractCollection.prototype.setPropertieId = function(propertieId) { this.propertieId = propertieId; };
	// Configura a propriedade que será usada como filtro quando nenhuma é especificada
	AbstractCollection.prototype.setDefaultPropertieFilter = function(def) { this.defaultPropertieFilter = def; };
	// Configura a propriedade que identifica unicamento uma linha
	AbstractCollection.prototype.filterMatchFunction = function(filterValue, obj, propertie) {
		if (propertie == undefined) {
			var tof, v, props = Object.keys(obj);

			for (var i = 0; i < props.length; i++) {
				v = obj[props[i]];

				tof = typeof(v);

				if (tof == 'string' || tof == 'number') {				
					v = String(v).toLowerCase();

					if (v.indexOf(filterValue) != -1) {
						return true;
					}
				}
			}
		} else {
			var v = fetchFromObject(obj, propertie);

			if (v != undefined && v != null) {
				return String(v).toLowerCase().indexOf(filterValue) != -1;
			}
		}

		return false;
	};
	// Configura a propriedade que identifica unicamento uma linha
	AbstractCollection.prototype.onFilterDone = function(linhasCurrent) {};
	// Obtem o ID referente a uma linha
	AbstractCollection.prototype.findId = function(linha) {
		if (this.propertieId == '_generatedId') {
			if (this['_idcount'] == undefined ) {
				this._idcount = 0;
			}

			this._idcount = this._idcount + 1;

			linha._generatedId = this._idcount;

			return linha._generatedId;
		} else {
			return fetchFromObject(linha, this.propertieId);
		}
	};


	// Lista em grid
	function GridCollection() {
		AbstractCollection.call(this);
	}
	GridCollection.prototype = Object.create(AbstractCollection.prototype);
	GridCollection.prototype.constructor = GridCollection;
	GridCollection.prototype.generate = function() {
		Object.getPrototypeOf(GridCollection.prototype).generate.call(this);
		
		var linhas = this.linhas;
		var onLinhaSelecionada = this.onSelected;
		var divLista = document.getElementById(this.containerId);
		divLista.scrollLeft = 0;
		
		var btnLeft = document.getElementById('btnListaLeft');
		var btnRight = document.getElementById('btnListaRight');
		
		if (!(linhas && linhas.length > 0)) {
			var msg = document.createElement('p');
			msg.style.fontSize = '20px';
			msg.appendChild(document.createTextNode('Nenhuma linha.'));

			divLista.appendChild(msg);
			
			if (btnLeft && btnRight) {
				removeElement(btnLeft);
				removeElement(btnRight);
			}
		} else {
			var container = document.createElement('div');
			container.className = 'lista_grid_container';
			divLista.appendChild(container);

			var self = this;
			this.appendColunasTo(linhas, container, onLinhaSelecionada, function(l){return self.findId(l);});
			
			var isListaOverflow = isOverflow(container);
			
			if (btnLeft && btnRight) {
				if (!isListaOverflow) {
					removeElement(btnLeft);
					removeElement(btnRight);
				}
			} else {
				if (isListaOverflow) {
					this.createBtnLeft(container);
					this.createBtnRight(container);
				}
			}
			
			// Permite scroll horizontal para a lista de linhas.
			$(container).bind("mousewheel DOMMouseScroll", onMouseWheelHorizontalScroll);
		}
	};
	// Adiciona as colunas referentes a um conjunto de linhas a um container
	GridCollection.prototype.appendColunasTo = function(linhas, divLista, onLinhaSelecionada, findIdFunction) {
		var limitePorColuna = this.calcBlocksPerColumn();
		var indexIni = 0;
		var indexFim = 0;
		
		do {
			indexFim = (indexFim + limitePorColuna > linhas.length) ? linhas.length : indexFim + limitePorColuna;
			
			divLista.appendChild(this.createColunaLista(linhas.slice(indexIni, indexFim), onLinhaSelecionada, findIdFunction));
			
			indexIni = indexFim;
		} while (indexIni < linhas.length);
	};
	// Cria uma coluna da lista de linhas contendo um conjunto de linhas
	GridCollection.prototype.createColunaLista = function(linhas, onLinhaSelecionada, findIdFunction) {
		if (linhas && linhas.length > 0) {
			var divListaColuna = document.createElement('div');
			divListaColuna.className = 'lista_coluna';
			
			var createBlocoLinha = this.createBlocoLinha;
			
			linhas.forEach(function(linha) {
				divListaColuna.appendChild(createBlocoLinha(linha, onLinhaSelecionada, findIdFunction));
			});
			
			return divListaColuna;
		}
		
		return null;
	};
	// Cria um bloco para da lista contendo os dados de uma linha
	GridCollection.prototype.createBlocoLinha = function(linha, onLinhaSelecionada, findIdFunction) {
		var aConteiner = document.createElement('a');
		aConteiner.id = findIdFunction(linha);
		
		// Evento de click na linha; configurar linha selecionada e pesquisar os sentidos pelo número
		if (onLinhaSelecionada) {
			aConteiner.addEventListener('click', function() {
				onLinhaSelecionada(linha);
			});
		}
		
		var divBloco = document.createElement('div');
		divBloco.className = 'lista_bloco';
		
		var divBlocoLinha = document.createElement('div');
		divBlocoLinha.className = 'lista_bloco_linha';
		divBlocoLinha.innerHTML = linha.numero;
		
		var divBlocoLinhaNome = document.createElement('div');
		divBlocoLinhaNome.className = 'lista_bloco_linha_nome';
		divBlocoLinhaNome.innerHTML = linha.descricao;
		
		var divBlocoLinhaPreco = document.createElement('div');
		divBlocoLinhaPreco.className = 'lista_bloco_linha_preco';
		if (linha.faixaTarifaria) {
			divBlocoLinhaPreco.innerHTML = 'R$ ' + linha.faixaTarifaria.tarifa;
		} else {
			divBlocoLinhaPreco.innerHTML = '';
		}
		
		//var divBlocoLinhaSentido = document.createElement('div');
		//divBlocoLinhaSentido.className = 'lista_bloco_linha_sentido';
		//divBlocoLinhaSentido.innerHTML = linha.sentido;
					
		divBloco.appendChild(divBlocoLinha);
		divBloco.appendChild(divBlocoLinhaNome);
		divBloco.appendChild(divBlocoLinhaPreco);
		//divBloco.append(divBlocoLinhaSentido);
		
		aConteiner.appendChild(divBloco);
		
		return aConteiner;
	};
	// Botão de scroll esquerdo
	GridCollection.prototype.createBtnLeft = function(divLista) {
		var btn = document.createElement('a');
		btn.id = 'btnListaLeft';
		btn.className = 'lista_btn_scroll lista_btn_left';
		
		var img = document.createElement('img');
		img.className = 'lista_btn_img';
		img.src = 'img/arrow.png';
		btn.appendChild(img);
		
		if (divLista) {
			divLista.appendChild(btn);
			
			$(btn).click(function() {
				event.preventDefault();
				
				$(divLista).animate({
					scrollLeft: "-=" + (screen.width - 200)
				}, "fast");
			});
		}
		return btn;
	};
	// Botão de scroll direito
	GridCollection.prototype.createBtnRight = function(divLista) {
		var btn = document.createElement('a');
		btn.id = 'btnListaRight';
		btn.className = 'lista_btn_scroll lista_btn_right';
		
		var img = document.createElement('img');
		img.className = 'lista_btn_img';
		img.src = 'img/arrow.png';
		img.setAttribute('style', '-ms-transform: rotate(180deg); -webkit-transform: rotate(180deg); transform: rotate(180deg);');
		btn.appendChild(img);
		
		if (divLista) {
			divLista.appendChild(btn);
			
			// Eventos dos botões de controle de scroll da lista de linhas
			$(btn).click(function() {
				event.preventDefault();
				$(divLista).animate({
					scrollLeft: "+=" + (screen.width - 200)
				}, "fast");
			});
		}
		return btn;
	};
	// Calcula quantidade de blocos por coluna do grid de acordo com o tamanho da janela
	GridCollection.prototype.calcBlocksPerColumn = function() {
		var topSpace = 209;
		var blockHeight = 152;
		var blocks = (screen.height - topSpace) / blockHeight;
		
		if (blocks < 1) {
			blocks = 1;
		}
		
		var limitePorColuna = parseInt(blocks);
		
		if (blocks > parseInt(blocks)) {
			limitePorColuna += 1;
			
			if (limitePorColuna > 4) {
				limitePorColuna = 4;
			}
		}
		
		return limitePorColuna;
	};


	// Lista em tabela
	function TableCollection() {
		AbstractCollection.call(this);
		this.tableId = 'tblList';
		this.headers = [];
		this.rowValuesSupplier = undefined;
		this.rowsPerPage = 25;
		this.enablePagiator = false;
		this.headerButtons = undefined;
		this.tdAtrributes = undefined;
		this.selectedRows = undefined;
		this.footerText = undefined;
		this.headerText = undefined;
		this.tableContainerClassName = 'lista_table_container';

		this.tableCellClass = 'lista_table_cell';
		this.tableHeaderCellClass = 'lista_table_cell';
		this.tableHeaderPanelClass = 'lista_table_head_panel';
		this.tableFootPanelClass = 'lista_table_foot_panel';
	}
	TableCollection.prototype = Object.create(AbstractCollection.prototype);
	TableCollection.prototype.constructor = TableCollection;
	TableCollection.prototype.generate = function() {
		Object.getPrototypeOf(TableCollection.prototype).generate.call(this);

		var divLista = document.getElementById(this.containerId);
		var linhas = this.linhas;
		var onLinhaSelecionada = this.onSelected;
		var supplier = this.rowValuesSupplier;
		var self = this;

		if (linhas && linhas.length > 0) {
			var table = this.createTable(this.headers, linhas, function(linha) {
				return supplier(linha);
			}, function(l) {
				return self.findId(l);
			}, {
				className: 'lista_table',
				rowProperties: {
					onClick: onLinhaSelecionada,
					cellClassName: self.tableCellClass,
					className: 'lista_table_row',
					selectedRowClassName: 'lista_table_row_selected'
				},
				headerProperties: {
					cellClassName: self.tableHeaderCellClass,
					className: 'lista_table_header'
				}
			});
			table.id = this.tableId;

			// Configura atributos especificados nos <td>
			if (this.tdAtrributes != undefined) {
				this.tdAtrributes.forEach(function(attr) {
					$(table).find('tr td:nth-child('+(attr.column + 1)+')').attr(attr.attr, attr.value);
				});
			}
			
			var tableContainer = document.createElement('div');
			//tableContainer.style.display = 'inline-block';
			tableContainer.style.position = 'relative';
			tableContainer.className = this.tableContainerClassName;
			
			var tableHeadPanel = document.createElement('div');
			tableHeadPanel.id = 'tableLinhasHeadPanel';
			tableHeadPanel.className = self.tableHeaderPanelClass;
			tableContainer.appendChild(tableHeadPanel);


			// Adição de botões do header
			if (this.headerButtons != undefined && this.headerButtons.length > 0) {
				var btnsContainer = document.createElement('div');
				btnsContainer.className = 'lista_table_head_panel_btn_container';

				this.headerButtons.forEach(function(btn) {
					btnsContainer.appendChild(self.getHeaderButton(btn));
				});
				tableHeadPanel.appendChild(btnsContainer);
				tableHeadPanel.className += ' lista_table_head_panel_with_btn';
			}

			// Adição de texto no header
			if (this.headerText != undefined) {
				tableHeadPanel.appendChild(this.getText(this.headerText));
			}

			
			tableContainer.appendChild(table);
			
			var tableFootPanel = document.createElement('div');
			tableFootPanel.id = 'tableLinhasFootPanel';
			tableFootPanel.className = self.tableFootPanelClass;
			tableContainer.appendChild(tableFootPanel);

			// Adição de texto no footer
			if (this.footerText != undefined) {
				tableFootPanel.style.textAlign = 'center';
				tableFootPanel.appendChild(this.getText(this.footerText));
			}

			
			var panels = ['#'+tableHeadPanel.id, '#'+tableFootPanel.id];
			
			$(table).attr('data-panels', panels);
			
			divLista.appendChild(tableContainer);
			
			if (this.enablePagiator) {
				this.addPagiator(table.id, panels, this.rowsPerPage);
			}
		} else {
			var msg = document.createElement('p');
			msg.style.fontSize = '20px';
			msg.appendChild(document.createTextNode('Nenhuma linha.'));

			divLista.appendChild(msg);
		}
	};
	// Adiciona controles de paginação para uma tabela
	TableCollection.prototype.addPagiator = function(tableId, panels, rowsPerPage) {
		tableId = (tableId) ? tableId : this.tableId;
		var $table = $('#'+tableId);
		
		// Paginador já não dicionado
		if ($table.attr('data-pagiator') != 'true') {
			
			// Nenhum painel passado, obter apartir do atributo na tabela
			if (!panels) {
				panels = $table.attr('data-panels').split(',');
				
				if (panels.length == 0) {
					// Nenhum painel para o paginador
					return;
				}
			}
			
			var $rows = $('#'+tableId+' tbody tr');
			var rowsShown = rowsPerPage ? rowsPerPage : 25;
			var numPages = $rows.length/rowsShown;
			
			if (numPages < 1) {
				// Nenhuma página é necessária
				return;
			}
			
			if (numPages > parseInt(numPages)) {	
				// Adição de última página com tamanho incompleto
				numPages = parseInt(numPages) + 1;
			}
			
			// Cria um botão de página
			function createPageNumber(number) {
				var elem = document.createElement('a');
				elem.setAttribute('data-rel', number - 1);
				elem.className = 'lista_table_page_number';
				elem.innerHTML = number;
				return elem;
			}
			
			// Adição dos botões de página
			panels.forEach(function(panel) {
				var $panel = $(panel);
				$panel.addClass('lista_table_panel_pagiator');

				var $container = $("<div class='lista_table_pagiator_container'></div>");

				$panel.append($container);
				
				for (var page = 1; page <= numPages; page++) {
					$container.append(createPageNumber(page));
				}
				
				$container.find('.lista_table_page_number:first').addClass('lista_table_page_number_active');
			});
			
			// Esconde todas as linhas da tabela
			$rows.slice(rowsShown).hide();
			
			// Obtem os botões de página dentro de conjunto de paineis
			function getPageNumbers(panels) {
				var $pageNumbers = $();
				panels.forEach(function(panel) {
					$pageNumbers = $pageNumbers.add($(panel).find('.lista_table_page_number'));
				});
				return $pageNumbers;
			}
			
			// Evento de click sobre os botões de página
			getPageNumbers(panels).bind('click', function(e) {
				e.preventDefault();
						
				// Nenhum botão ativo
				getPageNumbers(panels).removeClass('lista_table_page_number_active');
				
				var currPage = $(this).attr('data-rel');
				
				// Somente botões da página clicada devem ficar ativos
				$.each(getPageNumbers(panels), function(i, val) {
					if (val.attributes['data-rel'].value == currPage) {
						$(val).addClass('lista_table_page_number_active');
					}
				});
				
				var $linhas = $('#'+tableId+' tbody tr');
				var startItem = currPage * rowsShown;
				var endItem = startItem + rowsShown;
				if (endItem > $linhas.length) {
					endItem = $linhas.length;
				}
				
				// Esconde todas as linhas, obtem e exibe as que deve ser mostradas, e anima com opacidade
				$linhas.css('opacity', '0.0').hide().slice(startItem, endItem).css('display','table-row').animate({opacity:1}, 300);
			});
			
			$table.attr('data-pagiator', 'true');	// Sinaliza tabela como paginada
		}
	};
	// Remove os controles de paginação de uma tabela
	TableCollection.prototype.removePagiator = function(tableId) {
		tableId = (tableId) ? tableId : this.tableId;
		
		var $table = $('#'+tableId);
		
		if ($table.attr('data-pagiator') == 'true') {
			var panels = $table.attr('data-panels').split(',');
			
			panels.forEach(function(panel) {
				$(panel+' .lista_table_page_number').remove();
			});
			
			$('#'+tableId+' tbody tr').css('display','table-row').animate({opacity:1}, 300);
			$table.attr('data-pagiator', 'false');
		}
	};
	// Cria uma tabela
	TableCollection.prototype.createTable = function(headers, rows, getRowValues, getRowId, properties) {
		var self = this;
		var table = document.createElement('table');
		table.className = (properties && properties.className) ? properties.className : '';
		
		var header = this.createTableHeader(headers, properties ? properties.headerProperties : undefined);
		table.appendChild(header);
		
		var tbody = document.createElement('tbody');
		var createTableRow = this.createTableRow;
		var rowCount = 0;
		rows.forEach(function(row) {
			var row = self.createTableRow(row, getRowValues, getRowId, properties ? properties.rowProperties : undefined);
			if (rowCount % 2 == 0) {				
				row.className += ' lista_table_row_alternate';
			}
			tbody.appendChild(row);
			rowCount += 1;
		});
		
		table.appendChild(tbody);
		
		return table;
	};
	// Cria uma linha de cabeçarios de uma tabela
	TableCollection.prototype.createTableHeader = function(headers, properties) {
		var tr = document.createElement('tr');
		tr.className = (properties && properties.className) ? properties.className : '';
		
		headers.forEach(function(header) {
			var th = document.createElement('th');
			th.className = (properties && properties.cellClassName) ? properties.cellClassName : '';
			th.innerHTML = header;
			tr.appendChild(th);
		});
		
		var thead = document.createElement('thead');
		thead.appendChild(tr);
		
		return thead;
	};
	// Cria uma linha da tabela
	TableCollection.prototype.createTableRow = function(rowObj, getRowValues, getRowId, properties) {
		var tr = document.createElement('tr');
		tr.setAttribute('data-display', 'table-row');
		tr.id = getRowId(rowObj);
		
		if (properties) {
			tr.className = (properties.className) ? properties.className : '';

			if (this.selectedRows != undefined && this.selectedRows.indexOf(rowObj) != -1) {
				tr.className += ' ' + properties.selectedRowClassName;
			}

			if (properties.onClick) {
				tr.addEventListener("click", function(e) {
					properties.onClick(rowObj, e.srcElement.getAttribute('data-index'));
				});
			}
		}
		
		getRowValues(rowObj).forEach(function(value, index) {
			var td = document.createElement('td');
			td.className = (properties && properties.cellClassName) ? properties.cellClassName : '';
			td.innerHTML = value;
			td.setAttribute('data-index', index);
			tr.appendChild(td);
		});
		
		return tr;
	};
	// Executado quando a lista sofre filtro
	TableCollection.prototype.onFilter = function(value, propertie) {
		Object.getPrototypeOf(TableCollection.prototype).onFilter.call(this, value, propertie);
		if (value.length > 0) {
			this.removePagiator(this.tableId);
		}
	};
	// Executado quando a lista perde filtro
	TableCollection.prototype.onFilterClear = function() {
		Object.getPrototypeOf(TableCollection.prototype).onFilterClear.call(this);
		this.addPagiator(this.tableId);
	};
	// Configura os headers da tabela
	TableCollection.prototype.setHeaders = function(headers) { this.headers = headers; };
	// Configura os headers da tabela
	TableCollection.prototype.setRowValuesSupplier = function(supplier) { this.rowValuesSupplier = supplier; };
	// Configura o ID que a tabela receberá
	TableCollection.prototype.setTableId = function(tableId) { this.tableId = tableId; };
	// Configura a quantidade de linhas será apresentada por página
	TableCollection.prototype.setRowsPerPage = function(rowsPerPage) { this.rowsPerPage = rowsPerPage; };
	// Configura se a tabela deve gerar um paginador
	TableCollection.prototype.setEnablePagiator = function(enable) { this.enablePagiator = enable; };
	// Configura se a tabela deve gerar um paginador
	TableCollection.prototype.onCellClick = function(linha, columnIndex) {};
	// Adiciona um botão para o header da tabela
	TableCollection.prototype.addHeaderButton = function(btn) {
		if (this.headerButtons == undefined) {
			this.headerButtons = [];
		}

		this.headerButtons.push(btn);
	};
	// Obtem o botão utilizado no header a partir de seus dados
	TableCollection.prototype.getHeaderButton = function(btn) {
		var a = document.createElement('a');
		a.className = 'lista_table_head_panel_btn';
		if (btn.btnclass) {
			a.className += ' ' + btn.btnclass;
		}
		if (btn.btntitle) {
			a.setAttribute('title', btn.btntitle);
		}
		a.setAttribute('href', '#');
		var img = document.createElement('img');
		img.src = btn.imgsrc;
		if (btn.imgclass) {
			img.className = btn.imgclass;
		}
		a.appendChild(img);
		a.onclick = btn.onclick;
		return a;
	};
	// Configura um texto para o header
	TableCollection.prototype.setHeaderText = function(msg) { this.headerText = msg; };
	// Configura um texto para o footer
	TableCollection.prototype.setFooterText = function(msg) { this.footerText = msg; };
	// Obtem o texto do footer
	TableCollection.prototype.getText = function(msg) {
		var text = document.createElement('span');
		if (msg.class) {
			text.className = msg.class;
		}
		text.innerHTML = msg.text;
		return text;
	};
	// Adiciona um atributo que será atribuído aos <td> de uma determinada columna identificada pelo seu índice.
	TableCollection.prototype.addTdAttribute = function(attribute, attrValue, columnIndex) {
		if (this.tdAtrributes == undefined) {
			this.tdAtrributes = [];
		}
		this.tdAtrributes.push({attr: attribute, value: attrValue, column: columnIndex});
	};
	// Configura quais linhas terão classe de selecionado
	TableCollection.prototype.setSelectedRows = function(rowsObjects) {
		this.selectedRows = rowsObjects;
	};


	return {
		AbstractCollectionClass: AbstractCollection,
		GridCollectionClass: GridCollection,
		TableCollectionClass: TableCollection
	};
})();

// Define os tipos de lista de linhas
M.listaLinhas = (function() {
	
	var gridList = new M.collections.GridCollectionClass();
	gridList.setContainerId('listaLinhas');
	gridList.setPropertieId('sequencial');
	gridList.onFilterDone = function(linhas) {
		currentListaLinhas = linhas;
	};
	gridList.onSelected = onLinhaSelecionadaLista;
	

	var tableList = new M.collections.TableCollectionClass();
	tableList.setContainerId('listaLinhas');
	tableList.setPropertieId('sequencial');
	tableList.setTableId('tableLinhas');
	tableList.setEnablePagiator(true);
	tableList.setRowsPerPage(25);
	tableList.setHeaders(['Número', 'Descrição', 'Valor (R$)']);
	tableList.setRowValuesSupplier(function(linha) {
		return [linha.numero, linha.descricao, (linha.faixaTarifaria) ? (linha.faixaTarifaria.tarifa).toFixed(2) : ''];
	});
	tableList.onFilterDone = function(linhas) {
		currentListaLinhas = linhas;
	};
	tableList.onSelected = onLinhaSelecionadaLista;

	return {
		'gridList': gridList,
		'tableList': tableList
	};
})();

// Módulo de integrações
M.integracao = {
	COLUMN_ORIGEM: 0,
	COLUMN_DESTINO: 2,
	TABLE_CONTAINER_ID: 'tabelaIntegracao',
	INPUT_FILTER_ID: 'filtroIntegracao',
	integracoes: undefined,
	selecionada: undefined,
	linhaOrigem: undefined,
	linhaDestino: undefined,
	loadIntegracao: undefined,
	tabelas: {
		integracao: (function() {
			var t = new M.collections.TableCollectionClass();
			t.setTableId('tblIntegracoes');
			t.setDefaultPropertieFilter('areaIntegracao.descricao');
			t.setEnablePagiator(false);
			t.setHeaders(['Da origem', 'Ponto de Integração', 'Para destino'/*, 'Caminhos'*/, 'Custo (R$)']);
			t.setRowValuesSupplier(function(integ) {
				var values = [];
				values.push(integ._linhaOrigem ? integ._linhaOrigem.numero : '');
				values.push(integ.areaIntegracao.descricao);
				values.push(integ._linhaDestino ? integ._linhaDestino.numero : '');
				/*values.push(integ.linhasOrigem.length * integ.linhasDestino.length);*/
				var custo = integ.calcCusto();
				values.push(custo != undefined ? custo.toFixed(2) : '');
				return values;
			});
			t.setFooterText({text: 'Toque na origem/destino para alternar entre as linhas', class: 'lista_table_foot_panel_text'});
			t.addTdAttribute('title', 'Trocar', 0);
			t.addTdAttribute('title', 'Trocar', 2);
			return t;
		})(),
		linhas: (function() {
			var t = new M.collections.TableCollectionClass();
			t.setTableId('tblIntegracoesLinhas');
			t.setPropertieId('numero');
			t.setHeaders(['Número', 'Descrição', 'Tarifa (R$)']);
			t.setRowValuesSupplier(function(linha) {
				return [linha.numero, linha.descricao, linha.tarifa ? Number(linha.tarifa).toFixed(2) : ''];
			});
			t.onClickBtnVoltar = function(){};
			t.addHeaderButton({
				btntitle: 'Voltar',
				imgsrc: 'img/arrow_right.png',
				imgclass: 'rotate_half',
				onclick: function(e) {
					e.preventDefault();
					t.onClickBtnVoltar();
				}
			});
			return t;
		})(),
		current: undefined
	},
	// Carrega as integrações
	loadIntegracoes: function(integracoes, loadIntegracao) {
		// Função que irá carregar uma integração selecionada
		this.loadIntegracao = loadIntegracao;

		// Pré-seleção das linhas de origem e destino das integrações
		integracoes.forEach(function(it) {
			[it.linhasOrigem, it.linhasDestino].forEach(function(linhas) {
				linhas.sort(function(l1,l2) {
					if (l1.tarifa && l2.tarifa) {
						return Number(l1.tarifa) - Number(l2.tarifa);
					} else {
						return (l1.tarifa) ? -1 : 1;
					}
				});
			});
			it._linhaOrigem = it.linhasOrigem[0];
			it._linhaDestino = it.linhasDestino[0];

			// Função de calculo do custo total da integração.
			it.calcCusto = function() {
				if (this._linhaOrigem && this._linhaOrigem.tarifa && this._linhaDestino && this._linhaDestino.tarifa) {
					return Number(this._linhaOrigem.tarifa) + Number(this._linhaDestino.tarifa);
				}
				return undefined;
			};
		});

		// Ordenação das integrações pela que apresenta o menor custo e o maior nº de caminhos
		integracoes.sort(function(i1, i2) {
			var v1 = i1.calcCusto();
			var v2 = i2.calcCusto();

			if (v1 != undefined && v2 != undefined && v1 != v2) {
				return v1 - v2;
			}

			v1 = i1.linhasOrigem.length * i1.linhasDestino.length;
			v2 = i2.linhasOrigem.length * i2.linhasDestino.length;
			return v2 - v1;
		});

		var self = this;

		if (integracoes == undefined) {
			integracoes = this.integracoes;
		} else {
			this.integracoes = integracoes;
		}

		this.tabelas.integracao.setLinhas(integracoes);
		this.tabelas.integracao.setContainerId(this.TABLE_CONTAINER_ID);
		this.tabelas.integracao.onSelected = function(i,c){self.onIntegracaoSelecionada(i,c);};
		this.showTable(this.tabelas.integracao);
	},
	// Mostra as linhas de origem referentes a uma integração
	showLinhasOrigem: function(integracao) {
		this.selecionada = integracao;
		this.tabelas.linhas.setHeaderText({text: 'Origem -> ' + integracao.areaIntegracao.descricao, class: 'lista_table_header_panel_text'});
		this.showLinhas(integracao, integracao.linhasOrigem);
	},
	// Mostra as linhas de destino referentes a uma integração
	showLinhasDestino: function(integracao) {
		this.selecionada = integracao;
		this.tabelas.linhas.setHeaderText({text: integracao.areaIntegracao.descricao + ' -> Destino', class: 'lista_table_header_panel_text'});
		this.showLinhas(integracao, integracao.linhasDestino);
	},
	// Mostra as linhas referentes a uma integração
	showLinhas: function(integracao, linhas) {
		var self = this;
		this.tabelas.linhas.setLinhas(linhas);
		this.tabelas.linhas.onSelected = function(l){self.onLinhaSelecionada(l);};
		this.tabelas.linhas.onClickBtnVoltar = function(l){self.showTable(self.tabelas.integracao, true);};
		this.tabelas.linhas.setContainerId(this.TABLE_CONTAINER_ID);
		this.tabelas.linhas.setSelectedRows([this.selecionada._linhaOrigem, this.selecionada._linhaDestino]);
		this.showTable(this.tabelas.linhas, true);
	},
	// Mostra uma tabela
	showTable: function(table, doAnimation) {
		var self = this;

		if (doAnimation) {
			// Mostrar tabela com animação
			var $container = $('#'+this.TABLE_CONTAINER_ID);
			$container.slideToggle('fast', function() {
				table.generate();
				$container.slideToggle('fast');
			});
		} else {
			table.generate();
		}

		this.tabelas.current = table;

		var $filtro = $('#' + this.INPUT_FILTER_ID);

		// Limpra filtro
		$filtro.val('');
		// Configura evento de filtro da lista das linhas da tabela
		$filtro.keyup(function() {
			self.tabelas.current.onFilter($filtro.val());
		});
	},
	// Executada quando uma integração é selecionada
	onIntegracaoSelecionada: function(integracao, column) {
		if (column == this.COLUMN_ORIGEM) {
			this.showLinhasOrigem(integracao);
		} else if (column == this.COLUMN_DESTINO) {
			this.showLinhasDestino(integracao);
		} else if (this.loadIntegracao != undefined) {
			this.loadIntegracao(integracao);
		}
	},
	// Executado quando uma linha é selecionada
	onLinhaSelecionada: function(linha) {
		if (this.selecionada.linhasOrigem.indexOf(linha) != -1) {
			this.selecionada._linhaOrigem = linha;
		} else {
			this.selecionada._linhaDestino = linha;
		}

		this.showTable(this.tabelas.integracao, true);
	}
};

// Controlador do componente de input switch
M.radioswitch = (function() {

	// Table abstrata de linhas
	function RadioSwitch() {
		this.radioSwitchId = undefined;
		this.valueLeft = {value: undefined, checked: false, containerClassName: 'radio_switch_container_left'};
		this.valueRight = {value: undefined, checked: false, containerClassName: 'radio_switch_container_right'};
	}
	// Configura o componente
	RadioSwitch.prototype.init = function(radioSwitchId, vLeft, vRight) {
		this.setRadioSwitchId(radioSwitchId);
		this.setValues(vLeft, vRight);
		var self = this;

		$('#'+radioSwitchId).find('.'+this.valueLeft.containerClassName).on('click', function() {
			self.check(self.valueLeft.value);
		});
		$('#'+radioSwitchId).find('.'+this.valueRight.containerClassName).on('click', function() {
			self.check(self.valueRight.value);
		});
	};
	// Configura o ID do radio switch
	RadioSwitch.prototype.setRadioSwitchId = function(radioSwitchId) { this.radioSwitchId = radioSwitchId; };
	// Configura os values
	RadioSwitch.prototype.setValues = function(vLeft, vRight) { this.valueLeft.value = vLeft; this.valueRight.value = vRight };
	// Configura os values
	RadioSwitch.prototype.check = function(value) {
		var currentValue = this.getCheckedValue();

		[this.valueLeft, this.valueRight].forEach(function(v) {
			v.checked = v.value == value;
		});

		if (this.valueLeft.value == value || this.valueRight.value == value) {
			this.onValueChange(value);
		}

		this.update();
	};
	// Obtem o valor corrente selecionado
	RadioSwitch.prototype.getCheckedValue = function() {
		var checked = [this.valueLeft, this.valueRight].filter(function(v) {
			return v.checked == true;
		});

		if (checked != undefined && checked.length == 1) {
			return checked[0].value;
		}

		return undefined;
	};
	// Atualiza o componente
	RadioSwitch.prototype.update = function() {
		var $radio = $('#'+this.radioSwitchId);

		[this.valueLeft, this.valueRight].forEach(function(v) {
			var $container = $radio.find('.'+v.containerClassName);

			$container.removeClass('radio_switch_container_checked');
			$container.removeClass('radio_switch_container_unchecked');

			$container.addClass(v.checked ? 'radio_switch_container_checked' : 'radio_switch_container_unchecked');
		});
	};
	// Executado quando o valor é alterado
	RadioSwitch.prototype.onValueChange = function(newValue) {};

	return {
		RadioSwitchClass: RadioSwitch
	};
})();

// Controlador da apresentação de uma integração
M.info = new Object();
M.info.integracao = {
	switchLinhasId: 'radioSwitchIntegracao',
	// Inicializa o objeto
	init: function() {
		this.switchLinhas = undefined;
		this.integracao = undefined;
		this.currentLinha = undefined;
	},
	// Apresenta uma integração
	showIntegracao: function(integracao) {
		this.init();
		this.integracao = integracao;
		this.initSwitchLinhas();
		display_div(this.switchLinhasId, 'inline-block');
		this.switchLinhas.check(this.integracao._linhaOrigem.numero);
	},
	// Inicializa o switch de linhas
	initSwitchLinhas: function() {
		this.switchLinhas = new M.radioswitch.RadioSwitchClass();
		var self = this;
		this.switchLinhas.onValueChange = function(v) { self.selecionarLinha(v); };
		this.switchLinhas.init(this.switchLinhasId, this.integracao._linhaOrigem.numero, this.integracao._linhaDestino.numero);
		$('#'+this.switchLinhasId).find('.radio_switch_container_left').find('.radio_switch_label_numero').html(this.integracao._linhaOrigem.numero);
		$('#'+this.switchLinhasId).find('.radio_switch_container_right').find('.radio_switch_label_numero').html(this.integracao._linhaDestino.numero);
	},
	// Seleciona uma linha para apresentação
	selecionarLinha: function(numLinha) {
		if (this.currentLinha && this.currentLinha.numero == numLinha) {
			return;
		}

		var linha = [this.integracao._linhaOrigem, this.integracao._linhaDestino].filter(function(l) {
			return l.numero == numLinha;
		})[0];

		this.currentLinha = linha;
		this.updateLinha();
	},
	// Atualiza os dados da linha para a corrente selecionada
	updateLinha: function() {
		var self = this;
		if (this.currentLinha) {
			M.loading.showTop();
			pesquisaLinhaByNumero(this.currentLinha.numero, function(data) {
				render('#linha');
				setLinhas(data);
				enableAlternadorLinhaIntegracao(true);
				pesquisaItinerario();
				pesquisaHorarios();
				loadAreaIntegracao(self.integracao.areaIntegracao);
			}, function() {
				M.loading.hideTop();
			});
		}
	}
};


// Árvore recolhivél
M.tree = (function() {

	function Supplier() {}
	Supplier.prototype.supplier = function(onSucceed, onFinally) {};


	function Node(label) {
		this.label = label;
		this.tree = undefined;
		this.containerContent = undefined;
		this.containerLoad = undefined;
		this.onLabelClickFunction = undefined;
		this.onIconClickFunction = undefined;
		this.preferedPosition = undefined;
		this.parentNode = undefined;
		this.defaultIcon = '';
		this.isExpanded = undefined;
		this.isSelected = false;
		this.data = {};
		this._listItemElement = undefined;
		this._isLoading = false;
		this._labelElement = undefined;
	}
	Node.prototype.onIconClick = function(onEventFunction) {
		this.onIconClickFunction = onEventFunction;
	};
	Node.prototype.onLabelClick = function(onEventFunction) {
		this.onLabelClickFunction = onEventFunction;
	};
	Node.prototype.showLoading = function() {
		this._isLoading = true;
		var self = this;
		$(this.containerContent).fadeOut('fast', function() {
			$(self.containerLoad).fadeIn();
		});
	};
	Node.prototype.hideLoading = function() {
		this._isLoading = false;
		var self = this;
		$(this.containerLoad).fadeOut('fast', function() {
			$(self.containerContent).fadeIn();
		});	
	};
	Node.prototype.load = function(supplier) {
		var self = this;

		this.showLoading();

		supplier.supplier(function(data) {
			var tree = new M.tree.TreeClass();
			tree.addNodes(data);
			self.generateTree(tree);
		}, function() {
			self.hideLoading();
		});
	};
	Node.prototype.generateTree = function(tree) {
		if (tree != undefined)  {
			this.tree = tree;		
		}

		this.containerContent.innerHTML = '';
		this.containerContent.appendChild(this.tree._generateContent());
	};
	Node.prototype.generate = function() {
		var self = this;

		var li = document.createElement('li');
		li.className = 'tree_list_item';

		var iconPanel = document.createElement('div');
		iconPanel.className = 'tree_list_item_icon_panel';
		iconPanel.addEventListener('click', function(e) {
			e.preventDefault();
			self._onClickIcon();
		});
		li.appendChild(iconPanel);

		var label = document.createElement('a');
		label.className = 'tree_label';

		label.innerHTML = this.label;
		label.addEventListener('click', function(e) {
			e.preventDefault();
			self._onClickLabel();
		});

		this._labelElement = label;
		li.appendChild(label);

		var container = document.createElement('div');

		this.containerContent = document.createElement('div');
		container.appendChild(this.containerContent);

		if (this.tree != undefined) {
			this.generateTree();
		}

		this.containerLoad = this._generateLoadPanel();
		container.appendChild(this.containerLoad);
		
		li.appendChild(container);

		this._listItemElement = li;

		if (this.isSelected) {
			this.select();
		}

		if (this.isExpanded != undefined) {
			this._updateExpandedState();
		}

		return li;
	};
	Node.prototype.select = function() {
		this._selectedState();
	};
	Node.prototype.unselect = function() {
		this._unselectedState();
	};
	Node.prototype._generateLoadPanel = function() {
		var panel = document.createElement('div');
		panel.style.display = 'none';
		panel.className = 'tree_list_item_loading_panel';

		var img = document.createElement('img');
		img.className = 'loading_animation';
		img.src = 'img/load_mini.png';

		panel.appendChild(img);

		return panel;
	};
	Node.prototype._selectedState = function() {
		$(this._labelElement).addClass('tree_label_selected');
		this.isSelected = true;
	};
	Node.prototype._unselectedState = function() {
		$(this._labelElement).removeClass('tree_label_selected');
		this.isSelected = false;
	};
	Node.prototype._updateExpandedState = function() {
		if (this.isExpanded != undefined) {
			if (this.isExpanded) {
				this._expandedState();
			} else {
				this._unexpandedState();
			}
		}
	};
	Node.prototype._expandedState = function() {
		$(this._listItemElement).css('list-style-image', 'url(img/minus.png)');
	};
	Node.prototype._unexpandedState = function() {
		$(this._listItemElement).css('list-style-image', 'url(img/plus.png)');
	};
	Node.prototype._onClickIcon = function() {
		if (!this._isLoading) {
			if (this.isExpanded == undefined) {
				this.isExpanded = true;
			} else {
				this.isExpanded = !this.isExpanded;
			}

			this._updateExpandedState();
		}

		if (this.onIconClickFunction != undefined) {
			this.onIconClickFunction(this);
		}
	};
	Node.prototype._onClickLabel = function() {
		/*if (!this._isLoading) {
			this._clickedState = !this._clickedState;

			if (this.isSpecialOne) {
				this.select();
			} else {
				if (this.alternateFoldIconOnClick) {
					$(this._listItemElement).css('list-style-image', this._clickedState ? 'url(img/minus.png)' : 'url(img/plus.png)');
				}
			}
		}*/

		this.select();

		if (this.onLabelClickFunction != undefined) {
			this.onLabelClickFunction(this);
		}
	};


	// Árvore
	function Tree(containerId) {
		this.containerId = containerId;
		this.nodes = [];
		this.onNodeExpandFunction = function(){};
		this.onNodeSelectedFunction = function(){};
		this._isFolded = false;
		this._listElement;
	}
	// Adiciona um conjunto de nós a árvore
	Tree.prototype.addNodes = function(nodes) {
		var self = this;
		nodes.forEach(function(node) {
			self.addNode(node);
		});
	};
	// Adiciona um nó à árvore
	Tree.prototype.addNode = function(node) {
		var self = this;

		node.onIconClick(function(n) {
			self._onNodeExpand(n);
		});
		node.onLabelClick(function(n) {
			self._onNodeSelected(n);
		});

		if (node.preferedPosition == undefined) {
			this.nodes.push(node);
		} else {
			this.nodes.splice(node.preferedPosition, 0, node);
		}
	};
	// Define o callback para a seleção de um nó
	Tree.prototype.onNodeSelected = function(onEventFunction) {
		this.onNodeSelectedFunction = onEventFunction;
	};
	// Define o callback para a expanção de um nó
	Tree.prototype.onNodeExpand = function(onEventFunction) {
		this.onNodeExpandFunction = onEventFunction;
	};
	// Gerá a árvore
	Tree.prototype.generateTree = function(containerId) {
		if (containerId) {
			this.containerId = containerId;
		}

		var container = document.getElementById(this.containerId);
		container.innerHTML = '';
		container.appendChild(this._generateContent());
	};
	//Gera o nós da árvore
	Tree.prototype._generateContent = function() {
		this._listElement = document.createElement('ul');
		if (this._isFolded) {
			this._listElement.style.display = 'none';
		}
		this._listElement.className = 'tree_list';

		for (var i = 0; i < this.nodes.length; i++) {
			this._listElement.appendChild(this.nodes[i].generate());
		}

		return this._listElement;
	};
	// Executado quando um nó da árvore é expandido
	Tree.prototype._onNodeExpand = function(node) {
		if (this.onNodeExpandFunction != undefined) {
			this.onNodeExpandFunction(node, this);
		}
	};
	// Executado quando um nó da árvore é selecionado
	Tree.prototype._onNodeSelected = function(node) {
		if (this.onNodeSelectedFunction != undefined) {
			this.onNodeSelectedFunction(node, this);
		}
	};
	// Alterna entre os estados de dobra da árvore
	Tree.prototype.foldToggle = function() {
		if (this._isFolded) {
			this.unfold();
		} else {
			this.fold();
		}
	};
	// Dobra a árvore
	Tree.prototype.fold = function() {
		this._isFolded = true;
		$(this._listElement).slideUp();
	};
	// Desdobra uma a árvore
	Tree.prototype.unfold = function() {
		this._isFolded = false;
		$(this._listElement).slideDown();
	};


	return {
		TreeClass: Tree,
		NodeClass: Node,
		SupplierClass: Supplier
	};
})();

// Path integração
M.path = (function() {
	// Um ponto no path
	function Point(label, data) {
		this.label = label;
		this.data = data;
		this.isFirstPoint = false;
		this.isLastPoint = false;
	}

	// Um par de dois pontos
	function Pair(pointA, pointB) {
		this.pointA = pointA;
		this.pointB = pointB;
		this.data = {};
		this.path = undefined;
		this.isSelected = false;
		this._pairElement = undefined;
		this._labelSupplerFunction = undefined;
		this._titleSupplerFunction = undefined;
	}
	// Verifica se o ponto é único entre origem e destino.
	Pair.prototype.isMiddlePoint = function() {
		return this.pointA.isFirstPoint && this.pointB.isLastPoint;
	};
	// Configura o pair como selecionado
	Pair.prototype.select = function() {
		$(this._pairElement).addClass('path_spacer_linha_label_selected');
	};
	// Configura o pair como não selecionado
	Pair.prototype.unselect = function() {
		$(this._pairElement).removeClass('path_spacer_linha_label_selected');
	};
	// Obtem a label para o pair
	Pair.prototype.getLabel = function() {
		return this._labelSupplerFunction != undefined ? this._labelSupplerFunction(this) : 'Selecionar';
	};
	// Obtem o title para o pair
	Pair.prototype.getTitle = function() {
		return this._titleSupplerFunction != undefined ? this._titleSupplerFunction(this) : 'Escolher';
	};
	// Configura um supplier para label do pair
	Pair.prototype.setLabelSupplier = function(labelSupplierFunction) {
		this._labelSupplerFunction = labelSupplierFunction;
	};
	// Configura um supplier para o title do pair
	Pair.prototype.setTitleSupplier = function(titleSupplierFunction) {
		this._titleSupplerFunction = titleSupplierFunction;
	};
	// Atualiza o elemento de modo a corresponder com o objeto
	Pair.prototype.update = function() {
		this._pairElement.innerHTML = this.getLabel();
		this._pairElement.title = this.getTitle();
	};

	// Path
	function Path(containerId) {
		this.points = [];
		this.pairs = undefined;
		this.containerId = containerId;
		this.onPairSelectedFunction = undefined;
		this.containerClassName = 'path_container';
		this._lastSelectedPair = undefined;
		this._pairLabelSupplierFunction = undefined;
	}
	// Configura um calback para o evento de seleção de um pair
	Path.prototype.onPairSelected = function(onEventFunction) {
		this.onPairSelectedFunction = onEventFunction;
	};
	// Adiciona pontos ao path
	Path.prototype.addPoints = function(points) {
		var self = this;
		points.forEach(function(p) {
			self.addPoint(p);
		});
		this._updatePairs();
	};
	// Adiciona um ponto ao path
	Path.prototype.addPoint = function(point) {
		this.points.push(point);
	};
	// Atualiza os pares de acordo com os pontos
	Path.prototype._updatePairs = function() {
		this.pairs = [];
		var self = this;

		this.points.reduce(function(pointA, pointB) {
			self.pairs.push(self._createPair(pointA, pointB));
			return pointB;
		});

		return this.pairs;
	};
	// Gera o path no seu container com animação de fade
	Path.prototype.generateInFade = function() {
		var self = this;
		var $container = $('#'+this.containerId);

		$container.fadeOut('fast', function() {
			self.generate();
			$container.fadeIn();
		});
	};
	// Gera o path no seu container
	Path.prototype.generate = function() {
		var self = this;
		var container = document.getElementById(this.containerId);
		container.innerHTML = '';
		container.className = this.containerClassName;

		this.points.forEach(function(point, index) {
			container.appendChild(self._createPointDiv(point));

			if (index != self.points.length -1) {
				container.appendChild(self._createSpacer(self.pairs[index]));
			}
		});
	};
	// Cria o elemento que representa um ponto
	Path.prototype._createPointDiv = function(point) {
		var div = document.createElement('div');
		div.className = 'path_point_container';

		var img = document.createElement('img');

		img.src = point.isFirstPoint || point.isLastPoint ? 'img/circle_green.png' : 'img/ponto_integracao.png';
		img.className = 'path_point_icon';

		div.appendChild(img);

		var labelContainer = document.createElement('div');
		labelContainer.className = 'path_point_label_container';
		
		var label = document.createElement('span');
		label.className = 'path_point_label';

		if (point.isFirstPoint || point.isLastPoint) {
			label.className += ' path_point_label_first_last';
		}

		label.innerHTML = point.label;
		labelContainer.appendChild(label);

		div.appendChild(labelContainer);

		return div;
	};
	// Cria um espaçador
	Path.prototype._createSpacer = function(pair) {
		var self = this;

		var div = document.createElement('div');
		div.className = 'path_spacer';

		var line = document.createElement('div');
		line.className = 'path_spacer_line';
		div.appendChild(line);

		var linhaContainer = document.createElement('div');
		linhaContainer.className = 'path_spacer_linha_container';

		var linha = document.createElement('span');
		linha.className = 'path_spacer_linha_label';
		linha.setAttribute('index', this.pairs.indexOf(pair));
		linha.addEventListener('click', function(event) {
			event.preventDefault();
			self._onClickPair(self.pairs[event.target.getAttribute('index')]);
		});
		pair._pairElement = linha;
		pair.update();
		linhaContainer.appendChild(linha);

		div.appendChild(linhaContainer);

		return div;
	};
	// Instancia um nova par para dados dois pontos
	Path.prototype._createPair = function(pointA, pointB) {
		var pair = new Pair(pointA, pointB);
		pair.path = this;
		pair.setLabelSupplier(this._pairLabelSupplierFunction);
		return pair;
	};
	// Executado quando um par é selecionado
	Path.prototype._onClickPair = function(pair) {
		if (this.onPairSelectedFunction) {
			this.onPairSelectedFunction(pair);
		}

		if (this._lastSelectedPair != undefined) {
			this._lastSelectedPair.unselect();
		}

		this._lastSelectedPair = pair;

		this._lastSelectedPair.select();
	};
	// Configura um supplier para as labels de um pair
	Path.prototype.setPairLabelSupplier = function(pairLabelSupplierFunction) {
		this._pairLabelSupplierFunction = pairLabelSupplierFunction;
	};

	return {
		PathClass: Path,
		PointClass: Point,
		PairClass: Pair
	};
})();

// Controlador de integrações 2
M.integracao2 = {
	model: (function() {
		function IntegracaoPoint(origem, destino, linha) {
			this.origem = origem;
			this.destino = destino;
			this.linha = linha;
		}

		function Integracao() {
			this.points = [];
		}
		Integracao.prototype.addPoints = function(points) {
			var self = this;
			points.forEach(function(p) {
				self.addPoint(p);
			});
		};
		Integracao.prototype.addPoint = function(point) {
			this.points.push(point);
		};

		return {IntegracaoPointClass: IntegracaoPoint, IntegracaoClass: Integracao};
	})(),
	origem: undefined,
	destino: undefined,
	btnFinalizarContainerId: 'btn_finalizar_integracao',
	loadingPanelId: 'integracao_loading_panel',
	treeContainerId: 'tree_integracao',
	pathContainerId: 'path_integracao',
	tabelaLinhasContainerId: 'integracao_container_linhas',
	tabelaContainerId: 'integracao_container_table',
	inputFiltroContainerId: 'input_filtro',
	tree: undefined,
	pathIntegracao: undefined,
	tabelaLinhas: undefined,
	_lastDestinoNode: undefined,
	// Carrega a tela de integrações para uma origem e destino
	load: function(origem, destino) {
		if (this.isAlreadyLoaded(origem, destino)) {
			return;
		}

		var self = this;

		this.origem = origem;
		this.destino = destino;

		pesquisarRotaEntity(origem.tipo, origem.id, function(entity) {
			self.origem.entity = entity;
		}, function() {
			pesquisarRotaEntity(destino.tipo, destino.id, function(entity) {
				self.destino.entity = entity;
			}, function() {
				setTimeout(function() {
					self.emptyPath();
				}, 500);
			});
		});

		this.loadTree();
	},
	// Verifica para se uma origem e destino já foi carregada
	isAlreadyLoaded: function(origem, destino) {
		if (this.origem != undefined && this.destino != undefined) {
			if (this.origem.tipo == origem.tipo && this.origem.id == origem.id) {
				if (this.destino.tipo == destino.tipo && this.destino.id == destino.id) {
					return true;
				}
			}
		}

		return false;
	},
	// Finaliza a corrente integração
	finalizar: function() {
		M.integracaoInfo.loadIntegracao(this._extracIntegracao(this.pathIntegracao.pairs));
		render('#integracao');
	},
	// Inicializa a árvore de integrações
	initTree: function() {
		var self = this;
		this.tree = new M.tree.TreeClass(this.treeContainerId);
		this.tree.onNodeExpand(function(node, tree) {
			self._onNodeExpand(node, tree);
		});
		this.tree.onNodeSelected(function(node, tree) {
			self._onNodeSelected(node, tree);
		});
	},
	// Inicializa a tabela de linhas
	initTableLinhas: function() {
		var self = this;

		var t = new M.collections.TableCollectionClass();
		t.setEnablePagiator(true);
		t.setTableId('tblLinhasIntegracao');
		t.setPropertieId('sequencial');
		t.setHeaders(['Número', 'Descrição', 'Tarifa (R$)']);
		t.setRowValuesSupplier(function(linha) {
			return [linha.numero, linha.descricao, linha.faixaTarifaria ? Number(linha.faixaTarifaria.tarifa).toFixed(2) : ''];
		});
		t.addHeaderButton({
			btntitle: 'Fechar',
			imgsrc: 'img/close_x.png',
			/*imgclass: 'rotate_half',*/
			onclick: function(e) {
				e.preventDefault();
				self._hideTable(true);
			}
		});
		
		this.tabelaLinhas = t;
	},
	// Carrega a árvore com base na origem e destino
	loadTree: function() {
		this.initTree();

		this.showLoadingPanel();
		var self = this;
		pesquisarAreasIntegracoes(this.origem.tipo, this.origem.id, this.destino.tipo, this.destino.id, function(areas) {
			if (areas && areas.length > 0) {
				self._addAreas(areas, self.tree);
				self.tree.generateTree();
			} else {
				self.showContainerMsg('Nenhuma integração é possível para a dada origem e destino.');
			}
		}, function() {
			self.hideLoadingPanel();
		});
	},
	// Exibe o botão finalizar
	showBtnFinalizar: function() {
		var self = this;

		var $container = $('#'+this.btnFinalizarContainerId);
		var $btn = $container.find('.form_button');
		$container.fadeIn();
		$btn.off('click');
		$btn.on('click', function(e) { e.preventDefault(); self.finalizar(); });
	},
	// Oculta o botão finalizar
	hideBtnFinalizar: function() {
		$('#'+this.btnFinalizarContainerId).fadeOut();
	},
	// Exibe o painel de loading
	showLoadingPanel: function() {
		$('#'+this.loadingPanelId).fadeIn();
	},
	// Oculta o painel de loading
	hideLoadingPanel: function() {
		$('#'+this.loadingPanelId).fadeOut();
	},
	// Apresenta uma mensagem no contaner
	showContainerMsg: function(msg) {
		$('#'+this.treeContainerId).html($("<p style='text-align: center;'>"+msg+"</p>")[0].outerHTML);
	},
	// Inicializa o path de integração vazio
	emptyPath: function() {
		this.setPath(this.createPath())
	},
	// Configura um path para a integração
	setPath: function(path) {
		this.pathIntegracao = path;
		this.pathIntegracao.generateInFade();
		this._checkIntegracaoFinalizada(path);
	},
	// Cria o path de integração para um array
	createPath: function(pathArray) {
		var self = this;
		var pathIntegracao = new M.path.PathClass(this.pathContainerId);
		pathIntegracao.setPairLabelSupplier(function(pair) {
			if (pair.isMiddlePoint()) {
				return 'Selecione um ponto de integração';
			}

			return pair.data.linha != undefined ? pair.data.linha.numero : 'Selecionar'; 
		});
		pathIntegracao.onPairSelected(function(pair) {self._onPathPairSelected(pair);});

		this._setPathPoints(pathIntegracao, pathArray);

		return pathIntegracao;
	},
	// Adiciona pontos ao path de integração
	_setPathPoints: function(path, pathArray) {
		var points = this._instanceOrigemDestinoPoints();

		if (pathArray != undefined) {
			this._mapPathToPoints(pathArray).forEach(function(p, index) {
				points.splice(index + 1, 0, p)
			});
		}

		path.addPoints(points);
	},
	// Instancia os pontos de origem e destino.
	_instanceOrigemDestinoPoints: function() {
		return [this._instanceOrigemPoint(), this._instanceDestinoPoint()];
	},
	// Instancia o ponto referente a origem
	_instanceOrigemPoint: function() {
		var label = this._entityDescricao(this.origem.entity);

		var point = new M.path.PointClass(label != undefined ? label : 'Origem', this.origem);
		point.isFirstPoint = true;
		return point;
	},
	// Instancia o ponto referente ao destino
	_instanceDestinoPoint: function() {
		var label = this._entityDescricao(this.destino.entity);

		var point = new M.path.PointClass(label != undefined ? label : 'Destino', this.destino);
		point.isLastPoint = true;
		return point;
	},
	// Adiciona áreas a árvore de integrações
	_addAreas: function(areas, tree) {
		var self = this;

		this._mapAreasToNodes(areas).forEach(function(node) {
			self._addNode(node, tree);
		});
	},
	// Adiciona um nó a uma árvore
	_addNode: function(node, tree) {
		tree.addNode(node);
	},
		// Responde aos eventos de click sobre os nós
	_onNodeExpand: function(node, parentTree) {
		var self = this;

		if (node.tree == undefined) {
			node.load({
				supplier: function(onSucceed, onFinally) {
					setTimeout(function() {
						pesquisarAreasIntegracoes(node.data.tipo, node.data.id, self.destino.tipo, self.destino.id, function(areas) {
							areas = self._mapAreasToNodes(areas);
							areas.forEach(function(n) {
								n.parentNode = node;
							});
							onSucceed(areas);
							
							node.tree.onNodeSelected(parentTree.onNodeSelectedFunction);
							node.tree.onNodeExpand(parentTree.onNodeExpandFunction);
						}, onFinally);
					}, 1000);
				}
			});
		} else {
			node.tree.foldToggle();
		}
	},
	// Responde aos eventos de click sobre os nós
	_onNodeSelected: function(node, parentTree) {
		var integracao = [];

		integracao.push(node);

		var parent = node.parentNode;

		if (parent != undefined) {
			do {
				integracao.splice(0, 0, parent);
				parent = parent.parentNode;
			} while (parent != undefined);
		}


		if (node.data.path == undefined) {
			node.data.path = this.createPath(integracao);
		}

		this.setPath(node.data.path);


		if (this._lastDestinoNode != undefined && this._lastDestinoNode != node) {
			this._lastDestinoNode.unselect();
		}

		this._lastDestinoNode = node;
		

		/*
		var self = this;

		if (node.tree == undefined) {
			if (node.data.tipo == 'areaintegracao') {
				node.load({
					supplier: function(onSucceed, onFinally) {
						setTimeout(function() {
							pesquisarAreasIntegracoes(node.data.tipo, node.data.id, self.destino.tipo, self.destino.id, function(areas) {
								areas = self._mapAreasToNodes(areas);
								//areas.splice(0, 0, self._buildDestinoNode());
								areas.forEach(function(n) {
									n.parentNode = node;
								});
								onSucceed(areas);
								
								node.tree.onNodeSelected(parentTree.onNodeSelectedFunction);
							}, onFinally);
						}, 1000);
					}
				});
			} else if (node.data.tipo == 'destino') {
				var integracao = [];

				var parent = node.parentNode;
				while (parent != undefined) {
					integracao.splice(0, 0, parent);
					parent = parent.parentNode;
				}

				this.selecionarIntegracao(integracao);

				if (this._lastDestinoNode != undefined && this._lastDestinoNode != node) {
					this._lastDestinoNode.unselect();
				}

				this._lastDestinoNode = node;
			}
		} else {
			node.tree.foldToggle();
		}*/
	},
	// Responde aos eventos de seleção de um pair (caminho) entre dois pontos no path.
	_onPathPairSelected: function(pair) {
		var self = this;

		if (pair.isMiddlePoint()) {
			$('#'+this.treeContainerId).fadeOut('fast', function() {
				$('#'+self.treeContainerId).fadeIn();
			});
		} else {
			if (this.tabelaLinhas == undefined) {
				this.initTableLinhas();
			}

			if (pair.data.linhas == undefined) {
				this.tabelaLinhas.setHeaderText({text: pair.pointA.label + ' -> ' + pair.pointB.label, class: 'lista_table_header_panel_text'});
				this._loadLinhas(pair, function(linhas) {
					pair.data.linhas = linhas;
					pair.data.linha = undefined;
					self._showTabelaLinhas(pair);
				});
			} else {
				self._showTabelaLinhas(pair);
			}
		}
	},
	// Responde aos eventos de seleção de uma linha em um pair
	_onLinhaSelected: function(linha, pair) {
		pair.data.linha = linha;
		pair.update();
		this._hideTable(true);

		this._checkIntegracaoFinalizada(pair.path);
	},
	// Mostra as linhas referentes a uma integração
	_loadLinhas: function(pair, onSucceed) {
		var dataA = pair.pointA.data instanceof M.tree.NodeClass ? pair.pointA.data.data : pair.pointA.data;
		var dataB = pair.pointB.data instanceof M.tree.NodeClass ? pair.pointB.data.data : pair.pointB.data;

		var self = this;

		M.loading.showTop();
		pesquisarLinhasByRef(dataA.tipo, dataA.id, dataB.tipo, dataB.id, function(linhas) {
			if (linhas) {
				linhas = reduceListaLinhas(linhas);
				linhas.sort(function(l1,l2) {
					if (l1.faixaTarifaria && l2.faixaTarifaria) {
						return Number(l1.faixaTarifaria.tarifa) - Number(l2.faixaTarifaria.tarifa);
					} else {
						return (l1.faixaTarifaria) ? -1 : 1;
					}
				});
			}

			onSucceed(linhas);
		}, function() {
			M.loading.hideTop();
		});
	},
	// Mostra a tabela de linhas
	_showTabelaLinhas: function(pair) {
		var self = this;
		this.tabelaLinhas.setLinhas(pair.data.linhas);
		this.tabelaLinhas.onSelected = function(l) { self._onLinhaSelected(l, pair); };
		this.tabelaLinhas.setContainerId(this.tabelaLinhasContainerId);

		if (pair != undefined && pair.data.linha != undefined) {
			this.tabelaLinhas.setSelectedRows([pair.data.linha]);
		}

		this._showTable(this.tabelaLinhas, true);
	},
	// Mostra uma tabela
	_showTable: function(table, doAnimation) {
		var self = this;

		if (doAnimation) {
			var idVisible = this.treeContainerId;

			if ($('#'+this.tabelaContainerId).is(":visible") && !$('#'+this.treeContainerId).is(":visible")) {
				idVisible = this.tabelaContainerId;
			}

			$('#'+idVisible).slideUp('fast', function() {
				table.generate();
				$('#'+self.tabelaContainerId).slideDown('fast');
			});
		} else {
			table.generate();
			$('#'+this.treeContainerId).hide();
			$('#'+self.tabelaContainerId).show();
		}

		var $filtro = $('#' + this.inputFiltroContainerId).find('input');
		$filtro.val('');
		$filtro.keyup(function(e) {
			self.tabelaLinhas.onFilter($(e.target).val());
		});
	},
	// Recolhe a tabela de linhas
	_hideTable: function(doAnimation) {
		var self = this;

		if (doAnimation) {
			$('#'+this.tabelaContainerId).slideUp('fast', function() {
				self.tree.generateTree();
				$('#'+self.treeContainerId).slideDown('fast');
			});
		} else {
			this.tree.generateTree();
			$('#'+this.tabelaContainerId).hide();
			$('#'+self.treeContainerId).show();
		}
	},
	// Realiza a verificação se a integração está completa para um dado path.
	_checkIntegracaoFinalizada: function(path) {
		if (path.pairs.every(function(p) { return p.data.linha != undefined; })) {
			this.showBtnFinalizar();
		} else {
			this.hideBtnFinalizar();
		}
	},
	// Mapeia um conjunto de áreas para um conjunto correspondente de nós
	_mapAreasToNodes: function(areas) {
		areas.sort(function(a1, a2) {
			return a1.descricao.localeCompare(a2.descricao);
		});
		return areas.map(this._instanceNodeForArea);
	},
	// Mapeia um path para um conjunto correspondente de pontos
	_mapPathToPoints: function(path) {
		return path.map(function(node) {
			return new M.path.PointClass(node.label, node);
		});
	},
	// Extrai de um array de pair os dados de uma integração
	_extracIntegracao: function(pairArray) {
		var self = this;

		var i = new this.model.IntegracaoClass();
		i.addPoints(pairArray.map(function(pair) {
			return new self.model.IntegracaoPointClass(pair.pointA, pair.pointB, pair.data.linha);
		}));

		return i;
	},
	// Instancia um nó referente a uma área de integração
	_instanceNodeForArea: function(area) {
		var node = new M.tree.NodeClass(area.descricao);
		node.data = {tipo: 'areaintegracao', id: area.sequencial, data: area};
		return node;
	},
	// Obtem a descrição referente a uma entity
	_entityDescricao: function(entity) {
		return entity != undefined ? entity.descricao : undefined;
	}/*,
	// Instancia o nó que representa o destino
	_buildDestinoNode: function() {
		var destinoNode = new M.tree.NodeClass('Destino');
		destinoNode.data = {tipo: 'destino'};
		destinoNode.isSpecialOne = true;
		return destinoNode;
	}*/
};


// Constrolador para visualização de um integração
M.integracaoInfo = {
	map: undefined,
	listaContainerId: 'integracao_info_lista',
	integracao: undefined,
	// Carrega uma integração
	loadIntegracao: function(integracao) {
		this.integracao = integracao;

		this.loadLista();

		mapaIntegracao.initMap();
	},
	// Carrega a lista de linhas da integração
	loadLista: function() {
		var container = document.getElementById(this.listaContainerId);
		container.innerHTML = '';

		this._generateLista(this.integracao).forEach(function(div) {
			container.appendChild(div);
		});
	},
	// Gera a lista de linhas da integração
	_generateLista: function(integracao) {
		var self = this;

		function newDivLinha(linha, self) {
			var div = document.createElement('div');
			div.innerHTML = linha.numero;
			div.className = 'info_integracao_lista_row info_integracao_lista_linha';
			div.title = 'Ver detalhes';
			div.addEventListener('click', function(e) {
				self._onClickLinha(e, linha);
			});

			return div;
		}

		function newDivPonto(ponto) {
			var div = document.createElement('div');
			div.innerHTML = ponto.label;
			div.className = 'info_integracao_lista_row info_integracao_lista_ponto';

			return div;	
		}

		function newSep() {
			var div = document.createElement('div');
			div.className = 'info_integracao_lista_row_sep';
			return div;
		}

		var pontos = integracao.points;

		var divs = [];
		divs.push(newDivPonto(pontos[0].origem));
		divs.push(newSep());
		divs.push(newDivLinha(pontos[0].linha, self));
		divs.push(newSep());
		divs.push(newDivPonto(pontos[0].destino));

		if (pontos.length > 1) {
			pontos = pontos.slice(1, pontos.length);

			pontos.forEach(function(point) {
				divs.push(newSep());
				divs.push(newDivLinha(point.linha, self));
				divs.push(newSep());
				divs.push(newDivPonto(point.destino));
			});
		}

		return divs;
	},
	// Carrega os dados de uma linha
	loadLinha: function(linha) {
		this._loadLinhaHorarios(linha);
	},
	// Carrega os horários de uma linha
	_loadLinhaHorarios: function(linha) {
		var self = this;
		M.loading.showHorario();

		pesquisaHorariosBySequencialLinha(linha.sequencial, function(data) {
			self._setHorariosLinha(data);
		}, function() {
			M.loading.hideHorario();
		});
	},
	// Configura os horários de uma linha
	_setHorariosLinha: function(listasHorarias) {
		console.log(listasHorarias);
	},
	// Responde ao event de click em uma linha da lista de integração
	_onClickLinha: function(event, linha) {
		this.loadLinha(linha);
	}
};


/****** ESPECÍFICOS ******/

// Verifica se um código de parada é válido.
function isCodParadaValido(codParada) {
	if (codParada) {
		codParada = codParada.trim();
		return isNumber(codParada);
	}
	return false;
}

// Verifica se um número de linha é válido.
function isNumeroLinhaValido(numero) {
	if (numero) {
		return (/(\d\d\d\.\d|\d\.\d\d\d)/.test(numero) || (numero.indexOf('.') == -1 && parseInt(numero) && numero.length == 4));
	}
	
	return false;
}

// Obtem uma array organizado dos dias da semana para um array de horários
function getDiasSemanaArray(horarios) {
	if (!horarios || horarios.length == 0) {
		return [];
	}

	function Turno(label) {
		this.label = label;
		this.horarios = [];
	}

	function Dia(label) {
		if (label == 'DOMINGO') {
			label = 'DOMINGO e FERIADO';
		}

		this.label = label;
		this.count = 0;
		this.turnos = TURNOS.map(function(turno) {
			return new Turno(turno);
		});
	}

	var diasSemana = DIAS_SEMANA.map(function(dia) {
		return new Dia(dia);
	});

	var existeHorarioIrregular = false;

	horarios.forEach(function(horario) {
		if (horario.diasSemana != 'SSSSSNN' && horario.diasSemana != 'NNNNNSN' && horario.diasSemana != 'NNNNNNS') {
			existeHorarioIrregular = true;
		}
	});

	function splitTurno(dia, horario) {
		var hora = horario.hora;

		if (hora >= 0) {
			if (hora >= 6) {
				if (hora >= 12) {
					if (hora >= 18) {
						dia.turnos[3].horarios.push(horario);
					} else {
						dia.turnos[2].horarios.push(horario);
					}
				} else {
					dia.turnos[1].horarios.push(horario);
				}
			} else {
				dia.turnos[0].horarios.push(horario);
			}
		}
	}

	if (existeHorarioIrregular) {
		horarios.forEach(function(horario) {
			if (isNumber(horario.hora)) {
				for (var dia = 0; dia < diasSemana.length; dia++) {
					if (horario.diasSemana.charAt(dia) == 'S') {						
						diasSemana[dia].count++;
						splitTurno(diasSemana[dia], horario);
					}
				}
			}
		});
	} else {
		var segSexta = new Dia('SEGUNDA-SEXTA');
		segSexta.isSegSexta = true;
		diasSemana = [segSexta].concat(diasSemana.slice(5, 7));

		horarios.forEach(function(horario) {
			if (isNumber(horario.hora)) {
				var dia = undefined;

				if (horario.diasSemana == 'SSSSSNN') {
					dia = 0;
				} else if (horario.diasSemana == 'NNNNNSN') {
					dia = 1;
				} else if (horario.diasSemana == 'NNNNNNS') {
					dia = 2;
				}

				if (dia != undefined) {
					diasSemana[dia].count++;
					splitTurno(diasSemana[dia], horario);
				}
			}
		});
	}
	
	return diasSemana;
}

// Constroi uma ávore horária a partir de um array de dias semana
function gerarTree(diasSemana, horizontalTree) {
	if (horizontalTree == undefined) {
		horizontalTree = false;
	}
	
	var listaDias = document.createElement('ul');
	listaDias.className = 'horario_lista_dias';

	diasSemana.forEach(function(dia) {
		if (dia.count > 0) {
			var itemDia = document.createElement('li');

			var labelDia = document.createElement('a');
			labelDia.className = 'horario_label_dia';
			labelDia.innerHTML = dia.label;
			itemDia.appendChild(labelDia);

			var listaTurnos = document.createElement('ul');
			listaTurnos.className = 'horario_lista_turnos';
			itemDia.appendChild(listaTurnos);
			
			dia.turnos.forEach(function(turno) {
				if (turno.horarios.length > 0) {
					var itemTurno = document.createElement('li');

					var turnoLabel = document.createElement('a');
					turnoLabel.className = 'horario_label_turno';
					turnoLabel.innerHTML = turno.label;
					itemTurno.appendChild(turnoLabel);

					var listaHorarios = document.createElement('ul');
					listaHorarios.className = 'horario_lista_horarios';
					itemTurno.appendChild(listaHorarios);
					
					var itemHorario;
					
					if (horizontalTree) {
						itemHorario = document.createElement('li');
						listaHorarios.appendChild(itemHorario);
					}
					
					turno.horarios.forEach(function(horario, index) {
						if (horario.horario.length == 4) {	// Adição de zero a esquerda em hora com único dígito
							horario.horario = '0' + horario.horario;
						}							
						
						if (horizontalTree) {
							itemHorario.innerHTML += horario.horario;
							
							if (index != turno.horarios.length - 1) {
								itemHorario.innerHTML += ' | '
							}
						} else {							
							itemHorario = document.createElement('li');

							if (linhaPesquisada.operadoras && linhaPesquisada.operadoras.length > 1) {
								itemHorario.innerHTML = horario.horario + ' - ' + horario.operador;
							} else {
								itemHorario.innerHTML = horario.horario;
							}

							listaHorarios.appendChild(itemHorario);
						}
					});

					listaTurnos.appendChild(itemTurno);
				}
			});

			listaDias.appendChild(itemDia);
		}
	});
	
	return listaDias;
}

// Constroi a arvore horaria com base num conjunto de horarios
function gerarArvoreHoraria(horariosSentidos, horizontalItems) {	
	var divTree = document.getElementById('tree-horario');
	divTree.innerHTML = '';

	if (horariosSentidos.length > 0) {
		horariosSentidos.forEach(function(sentido) {
			var divSentido = document.createElement('div');
			divSentido.appendChild(document.createElement('br'));

			var sentidoLabel = document.createElement('font');
			sentidoLabel.className = 'horario_label_sentido';
			sentidoLabel.innerHTML = 'Sentido: ' + sentido.label;
			divSentido.appendChild(sentidoLabel);

			divSentido.appendChild(document.createElement('br'));

			if (sentido.diasSemana.length > 0) {
				var treeDiasSemana = gerarTree(sentido.diasSemana, horizontalItems);
				divSentido.appendChild(treeDiasSemana);


				sentidoLabel.style.cursor = "pointer";	// Evento que recolhe/abre toda a árvore horária
				sentidoLabel.addEventListener("click", function() {
					var listaTurnos = $(treeDiasSemana).find('.horario_lista_turnos');

					// Verifica se existe pelo menos uma dia aberto (lista de turno visível)
					var isAlgumDiaAberto = false;
					listaTurnos.each(function() {	
						if ($(this).is(':visible')) {
							isAlgumDiaAberto = true;
						}
					});

					// Parada cada lista de turno...
					listaTurnos.each(function toggleElements() {
						var $obj = $(this);

						// Recursivamente verifica a lista de horários em cada turno
						$obj.find('.horario_lista_horarios').each(toggleElements);

						// Se existe algum dia aberto (lista de turno visível), então recolher tudo
						if ($obj.is(isAlgumDiaAberto ? ':visible': ':hidden')) {
							$obj.toggle();
						}
					});					
				});

			} else {
				divSentido.appendChild('Nenhum horário.');
			}

			divTree.appendChild(divSentido);
		});

		treeToggleControl('tree-horario');
	} else {
		divTree.innerHTML = 'Nenhum horário.';
	}
}

// Constroi o lista de itinerário descritivo
function gerarItinerarios(itinerarios) {
	var divItinerarios = document.getElementById('divItinerarios');
	divItinerarios.innerHTML = '';

	if (itinerarios.length > 0) {
		itinerarios.forEach(function(itinerario) {
			var divItinerario = document.createElement('div');
			divItinerario.appendChild(document.createElement('br'));

			var sentido = document.createElement('font');
			sentido.className = 'itinerario_sentido';
			sentido.innerHTML = itinerario.sentido;
			divItinerario.appendChild(sentido);

			var extensao = document.createElement('font');
			extensao.className = 'itinerario_extensao';
			extensao.innerHTML = ' - Extensão: ' + itinerario.extensao + ' km';
			divItinerario.appendChild(extensao);

			divItinerario.appendChild(document.createElement('br'));

			var divItDesc = document.createElement('div');
			divItDesc.style.display = 'inline';

			itinerario.itinerario.forEach(function(it) {
				divItDesc.appendChild(document.createElement('br'));

				var seq = document.createElement('font');
				seq.className = 'itinerario_descricao_seq';
				seq.innerHTML = it.sequencial + ' - ';
				divItDesc.appendChild(seq);

				var desc = document.createElement('font');
				desc.className = 'itinerario_descricao_desc';
				desc.innerHTML = it.via + ' | ' + it.localidade;
				divItDesc.appendChild(desc);
			});

			divItinerario.appendChild(divItDesc);

			divItinerarios.appendChild(divItinerario);
		});
	} else {
		divItinerarios.innerHTML = 'Nenhum itinerário.';
	}
}

// Obtem o padrão horário referente ao corrente dia.
function getCurrentDiaPadrao() {
	var day = new Date().getDay();

	switch (day) {
		case 0: 
			return 'DOMINGO';
		case 1:
		case 2:
		case 3:
		case 4:
		case 5:
			return 'SEG_SEX';
		case 6:
			return 'SABADO';
	}
}

// Obtem o horário parada mais próximo da corrente hora
function sortHorariosParada(horariosParada) {
	if (horariosParada && horariosParada.length > 0) {
		function getHours() {
			if (this.horarioParada) {
				return Number(this.horarioParada.split(':')[0]);
			}
		}
		function getMinutes() {
			if (this.horarioParada) {
				return Number(this.horarioParada.split(':')[1]);
			}
		}

		horariosParada.forEach(function(h) {
			h.getHours = getHours;
			h.getMinutes = getMinutes;
		});

		horariosParada.sort(function(a, b) {
			if (!a.horarioParada) {
				return 1;
			} else if (!b.horarioParada) {
				return -1;
			}

			if (a.getHours() == b.getHours()) {
				return a.getMinutes() - b.getMinutes();
			} else {
				return a.getHours() - b.getHours();
			}
		});
	}

	return undefined;
}

// Obtem o horário parada mais próximo de um determinado tempo
function findNextHorarioParada(horariosParada, date) {
	var i;
	for (i = 0; i < horariosParada.length; i++) {
		var hora = horariosParada[i].getHours();
		if (hora > date.getHours()) {
			break;
		} else if (hora == date.getHours()) {
			var minuto = horariosParada[i].getMinutes();
			if (minuto >= date.getMinutes()) {
				break;
			}
		}
	}

	return (i == horariosParada) ? horariosParada[0] : horariosParada[i];
}




// Configura propriedades iniciais do mapa
function initMap(divMap) {
	if ($('#' + divMap).length > 0) {
	    $('#' + divMap).empty();

	    var map = new OpenLayers.Map(divMap, {
	        maxExtent: new OpenLayers.Bounds(-128 * 156543.0339, -128 * 156543.0339, 128 * 156543.0339, 128 * 156543.0339),
	        maxResolution: 156543.0339,
	        units: 'm',
	        projection: new OpenLayers.Projection('EPSG:900913')
	    });

	    map.addControl(new OpenLayers.Control.LayerSwitcher());
	    map.addControl(new OpenLayers.Control.MousePosition());

	    var tileServers;

	    if (USE_WEB_SERVER_FOR_TILES) {
	    	tileServers = [
		    		WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/tiles/a', 
		    		WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/tiles/b', 
		    		WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/tiles/c'
	    		];
	    } else {
	    	tileServers = DEFAULT_TILE_SERVERS;
	    }

	    var olmapnik = new OpenLayers.Layer.OSM("OpenStreetMap", [
	        tileServers[0] + '/${z}/${x}/${y}.png',
	        tileServers[1] + '/${z}/${x}/${y}.png',
	        tileServers[2] + '/${z}/${x}/${y}.png'
		], null);
	    map.addLayer(olmapnik);

		var mosaico_df_2014_GMComp_tms_layer = new OpenLayers.Layer.TMS("Foto Aérea 2015 - Codeplan", 
			"https://ortofoto.mapa.codeplan.df.gov.br/tms/",
	        {
	          layername: 'mosaico_df_2015@GMComp', type: "png", serviceVersion:"1.0.0",
	          gutter:0,buffer:0,isBaseLayer:true,transitionEffect:'resize',
	          tileOrigin: new OpenLayers.LonLat(-20037508.342789,-20037508.342789),
	          resolutions:[156543.03392804099712520838,78271.51696402048401068896,39135.75848201022745342925,19567.87924100512100267224,9783.93962050256050133612,4891.96981025128025066806,2445.98490512564012533403,1222.99245256282006266702,611.49622628141003133351,305.74811314070478829308,152.87405657035250783338,76.43702828517623970583,38.21851414258812695834,19.10925707129405992646,9.55462853564703173959,4.77731426782351586979,2.38865713391175793490,1.19432856695587897633,0.59716428347793950593,0.29858214170000003662,0.14929107089999997804],
	          zoomOffset:0,
	          units:"m",
	          maxExtent: new OpenLayers.Bounds(-20037508.342789,-20037508.342789,20037508.342789,20037508.342789),
	          projection: new OpenLayers.Projection("EPSG:900913".toUpperCase()),
	          sphericalMercator: true
	        }
	    );
	    map.addLayer(mosaico_df_2014_GMComp_tms_layer);
	    map.setBaseLayer(olmapnik);
	    map.setCenter(new OpenLayers.LonLat(-5330000, -1780000), 12);

	    if (!map.getCenter()) {
	        map.zoomToMaxExtent();
	    }

		$("#OpenLayers_Control_Attribution_7").remove();
		$(".olControlAttribution").remove();

		// Personalização do botão de seleção de camadas.
		$('#' + divMap).find('#OpenLayers_Control_MaximizeDiv > img').remove();
		var text = $("<span style='font-weight: bold; color: yellow; font-size: 16px;'></span>").text('+');
		$('#' + divMap).find('#OpenLayers_Control_MaximizeDiv').append(text);
	    
		return map;
	}
}

// Dado um conjunto de sentidos de uma linha recolhe um conjunto válido. Obs.: necessário, algumas linhas estão com múltipos mesmos sentidos.
function filtrarSentidos(linhas) {
	if (linhas.length > 0) {
		if (linhas.length == 1) {	// A linha possue somente um sentido...
			return linhas;
		} else if (linhas.length == 2) {	// A linha possue dois sentidos, teoricamente IDA e VOLTA...
			if ((linhas[0].sentido == 'IDA' && linhas[1].sentido == 'VOLTA') || (linhas[0].sentido == 'VOLTA' && linhas[1].sentido == 'IDA')) {
				return linhas;
			}
			
			if (linhas[0].sentido == 'IDA') {	// Linha incomum, daremos preferência ao sentido de IDA
				return [linhas[0]];
			} else {
				return [linhas[1]];
			}
		} else {
			var filtradas = linhas.filter(function(linha) {
				return linha.sentido == 'IDA';
			});
			
			if (filtradas.length > 0) {	// Linha incomum, mais de 2 sentidos, preferência ao sentido IDA com VOLTA
				var volta = linhas.filter(function(linha) {
					return linha.sentido == 'VOLTA';
				})[0];	
			
				return [filtradas[0], volta];
			}
			
			filtradas = linhas.filter(function(linha) {
				return linha.sentido == 'CIRCULAR';
			});
			
			if (filtradas.length > 0) {	// Linha incomum, mais de 2 sentidos, preferência ao sentido CIRCULAR
				return [filtradas[0]];
			}
			
			return [linhas[0]];	// Linha incomum, mais de 2 sentidos, sem preferência
		}
	}
	
	return [];
}

// Obtem a primeira linha de um array com um determinado sentido.
function getLinhaSentido(linhas, sentido) {
	var linha = linhas.filter(function(l) {
		return l.sentido == sentido;
	});
	
	if (linha.length > 0) {
		return linha[0];
	}
	
	return null;
}

// Reseta a pesquisa da linha corrente
function resetPesquisa() {
	delete linhaPesquisada.linha;
	delete linhaPesquisada.horarios;
	delete linhaPesquisada.itinerarios;
	delete linhaPesquisada.linhas;
	listaLinhas = undefined;
	linhaSelecionada = undefined;
}

// Pesquisa linha por número.
function pesquisarFormLinha(numero) {
	if (isNumeroLinhaValido(numero)) {
		M.loading.showTop();
		M.loading.showLinha();
		
		pesquisaLinhaByNumero(numero, function(data) {
			if (data && data.length > 0) {
				M.analytics.submitPesquisaLinhaByNumero(numero, true);

				render('#linha');
				setLinhas(data);
				pesquisaItinerario();
				pesquisaHorarios();
			} else {
				M.analytics.submitPesquisaLinhaByNumero(numero, false);

				console.log('<-> linha não encontrada: ' + numero);
				M.messages.showInfo('<-> linha não encontrada.');
			}
		}, function() {
			M.loading.hideTop();
			M.loading.hideLinha();
		});
	} else {
		// Usuário informou linha inválida, pesquisar linhas com o valor informado
		if (numero.length > 0) {
			M.loading.showTop();
			M.loading.showLista();
			
			pesquisaLinhasLike(numero, function(linhas) {
				if (linhas && linhas.length > 0) {
					M.analytics.submitPesquisaLinhaByDesc(numero, true);

					render('#linhas');
					setListaLinhas(linhas);
				} else {
					M.analytics.submitPesquisaLinhaByDesc(numero, false);

					console.log('<-> nenhuma linha encontrada para a pesquisa: ' + numero);
					M.messages.showInfo('<-> nenhuma linha encontrada.');
				}
			}, function() {
				M.loading.hideTop();
				M.loading.hideLista();
			}, 100, true);
		}

		//M.messages.showWarn('<!> número informado é inválido!');
	}
}

// Pesquisa linhas por referência
function pesquisarFormRef(origem, destino) {
	if (origem && destino) {

		var loading = {
			enable: true,
			show: function() {
				if (this.enable) {
					M.loading.showTop();
					M.loading.showLista();
				}
			},
			hide: function(enable) {
				if (enable != undefined) {
					this.enable = enable;
				}

				if (this.enable) {
					M.loading.hideTop();
					M.loading.hideLista();
				}	
			}
		}

		loading.show();
		
		pesquisarLinhasByRef(origem.tipo, origem.id, destino.tipo, destino.id, function(linhas) {
			if (linhas.length > 0) {	// Se existe pelo menos uma linha direta, mostar lista
				render('#linhas');
				setListaLinhas(linhas);
			} else {					// Não existindo linha direta, pesquisar integrações possíveis
				console.log('<-> nenhuma linha direta encontrada, necessário fazer integração');
				M.messages.showInfo('<-> nenhuma linha direta encontrada, necessário fazer integração');

				/*loading.enable = false;

				console.log('<-> nenhuma linha direta encontrada para: ' + origem.tipo + ':' + origem.id + ' - ' + destino.tipo + ':' + destino.id + ' - Consultando integrações');
				M.messages.showInfo('<-> nenhuma linha direta encontrada, consultando intregrações possíveis...');

				pesquisarIntegracoes(origem.tipo, origem.id, destino.tipo, destino.id, function(integracoes) {
					if (integracoes && integracoes.length > 0) {
						render('#linhas');
						setIntegracoes(integracoes);
					} else {
						console.log('<-> nenhuma integração para: ' + origem.tipo + ':' + origem.id + ' - ' + destino.tipo + ':' + destino.id);
						M.messages.showInfo('<-> nenhuma integração encontrada.');
					}
				}, function() {
					loading.hide(true);
				});*/
			}
		}, function() {
			loading.hide();
		});
	} else {
		M.messages.showWarn('<!> referências nulas informadas.');
	}
}

// Realiza a pesquisa do formulário de parada
function pesquisarFormParada(paradaOrigem, paradaDestino) {
	paradaOrigem = paradaOrigem.trim();
	paradaDestino = paradaDestino.trim();
	
	function getFeatureUrlPath(feature) {
		if (feature) {
			return (feature.attributes.featureType == 'parada') ? 'paradacod' : feature.attributes.featureType;
		}
	}

	var tipoParadaOrigem = getFeatureUrlPath(mapaParadas.origemFeature);
	var tipoParadaDestino = getFeatureUrlPath(mapaParadas.destinoFeature);

	if (!tipoParadaOrigem) {
		tipoParadaOrigem = paradaOrigem.length == 4 ? 'paradacod' : 'estacao';
	}
	if (!tipoParadaDestino) {
		tipoParadaDestino = paradaDestino.length == 4 ? 'paradacod' : 'estacao';
	}
	
	pesquisarFormRef({
		tipo: tipoParadaOrigem,
		id: paradaOrigem
	}, {
		tipo: tipoParadaDestino,
		id: paradaDestino
	});
}

// Evento do botão do formulário da página.
function pesquisar(evt) {
	if (evt != null) {
		evt.preventDefault();
	}

	resetPesquisa();
	
	var opcao = getRadioGroupValue(document.formPesq.opcao);

	switch(opcao) {
		case 'form_linha':
			var numero = document.getElementById('inputNumeroLinha').value;
			
			pesquisarFormLinha(numero);
			break;
		case 'form_cidade':
			var selects = document.getElementsByClassName('form_select');
			
			if (selects[0].value && selects[1].value) {
				pesquisarFormRef({
					tipo: 'ra',
					id: selects[0].value
				}, {
					tipo: 'ra',
					id: selects[1].value
				});

				M.analytics.submitPesquisaCidade($(selects[0]).find(':selected').text(), $(selects[1]).find(':selected').text());
			} else {
				M.messages.showWarn('<!> informe cidades de origem e destino válidas.');
			}
			break;
		case 'form_parada':
			var paradaOrigem = document.getElementById('paradaOrigemMapa').value;
			var paradaDestino = document.getElementById('paradaDestinoMapa').value;
			
			if (isCodParadaValido(paradaOrigem) && isCodParadaValido(paradaDestino)) {
				pesquisarFormParada(paradaOrigem, paradaDestino);

				M.analytics.submitPesquisaParada(paradaOrigem, paradaDestino);
			} else {
				M.messages.showWarn('<!> informe números de paradas válidos.');
			}
			break;
		case 'form_referencia':
			var origem = $("#refOrigem").select2('data');
			var destino = $("#refDestino").select2('data');
			
			if (origem.length > 0 && destino.length > 0) {
				origem = origem[0];
				destino = destino[0];

				pesquisarFormRef(origem, destino);

				M.analytics.submitPesquisaReferencia(origem, destino);
			} else {
				M.messages.showWarn('<!> informe as referências de origem e destino.');
			}
			break;
		default:
			M.messages.showWarn('<!> selecione o campo de pesquisa.');
	}

	// Pesquisa diferente de parada, esquecer origem/destino selecionados
	if (opcao != 'form_parada') {
		mapaParadas.resetSelectedFeatures();
		// Esquecer features origem/destino no mapa de percurso
		mapaPercurso.removeSelectedFeatures();
	}
}



/****** CARREGAMENTO DE DADOS CONSULTADOS ******/

// Carrega a tabela de integrações
function setIntegracoes(integracoes) {
	if (!integracoes || integracoes.length == 0) {
		return;
	}

	$('#containerLinhasLista').hide();
	$('#containerIntegracao').show();

	M.integracao.loadIntegracoes(integracoes, function(i) {
		M.info.integracao.showIntegracao(i);
	});
}

// Carrega no mapa o percurso de uma linha identificada pelo seu sequencial.
function loadLinhaPercurso(linha) {
	mapaPercurso.loadPercurso(linha);

	if (mapaParadas.origemFeature && mapaParadas.destinoFeature) {
		mapaPercurso.addSelectedFeatures([mapaParadas.origemFeature, mapaParadas.destinoFeature]);
	}

	mapaPercurso.loadParadas(linha);

    // Requisita a localização do usuário no mapa
    if (!isLocationDisabled) {
    	setTimeout(function() {
			mapaPercurso.requestLocation(true, true);
    	}, 1000);
	}
}

// Carrega no mapa de percurso uma área de integração.
function loadAreaIntegracao(areaIntegracao) {
	mapaPercurso.loadAreaIntegracao(areaIntegracao);
}

// Carrega as paradas no mapa de paradas
function loadParadas() {
	var map = initMap('map');

	$('#mapa-parada').on('mousewheel', function(evt) { evt.preventDefault(); });

	mapaParadas.map = map;

	// Camada dos pontos selecionados
	mapaParadas.selectedsLayer = new OpenLayers.Layer.Vector('selecionados');
	mapaParadas.selectedsLayer.styleMap = mapa.styles.newSelectedsLayer();//selectedsLayer;



	/*var areasIntegracao = new OpenLayers.Layer.Vector('areasintegracao', {
		strategies:  [new OpenLayers.Strategy.Fixed()]
    });
	areasIntegracao.protocol = new OpenLayers.Protocol.HTTP({
            isBaseLayer: false,
            url: WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/areaintegracao/geo/areas',
            format: new OpenLayers.Format.GeoJSON(),
            parseFeatures: function(data) {
            	var data = this.format.read(data.responseText);

            	for (var i = 0; i < data.length; i++) {
            		data[i].attributes.featureType = 'area';
            	}

            	return data;
            }
    });
    map.addLayer(areasIntegracao);*/




	var localFeatures = localStorage.getItem('paradas');

	// Camada das paradas de ônibus
    var paradas = new OpenLayers.Layer.Vector('paradas', {
		strategies: (function() {
			if (localFeatures) {
				return [
					new OpenLayers.Strategy.CenteredCluster({
					    autoActivate: true,
					    threshold: 2,
					    distance: 65
					})
					/*new OpenLayers.Strategy.AnimatedCluster({
						distance: 65,
						animationMethod: OpenLayers.Easing.Expo.easeOut,
						animationDuration: 20
					})*/
				];
			} else {
				return [

					new OpenLayers.Strategy.CenteredCluster({
					    autoActivate: true,
					    threshold: 2,
					    distance: 65
					}),
					/*new OpenLayers.Strategy.Cluster({
						distance: 65
					}),*/
					new OpenLayers.Strategy.Fixed()
					/*new OpenLayers.Strategy.AnimatedCluster({
						distance: 65,
						animationMethod: OpenLayers.Easing.Expo.easeOut,
						animationDuration: 20
					})*/
				];
			}
		})()
    });
    mapaParadas.paradas = paradas;

    if (!localFeatures) {	// Features não armazenados, buscar do webservice
    	console.log('Load [paradas] from remote server');

    	paradas.protocol = new OpenLayers.Protocol.HTTP({
            isBaseLayer: true,
            url: WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/parada/geo/paradas',
            format: new OpenLayers.Format.GeoJSON(),
            parseFeatures: function(data) {
            	var data = this.format.read(data.responseText);

            	for (var i = 0; i < data.length; i++) {
            		data[i].attributes.featureType = 'parada';
            	}

            	return data;
            }
        });

	    paradas.events.on({'loadend': function(e) {
	    	if (e.response.features && e.response.features.length > 0) {
	    		localStorage.setItem('paradas', new OpenLayers.Format.GeoJSON().write(e.response.features));
	    	}
	    }});
	}
	
    paradas.styleMap = mapa.styles.paradasLayer;


	var localFeaturesTerminais = localStorage.getItem('terminais');
	
	// Camada dos terminais de ônibus
    var terminais = new OpenLayers.Layer.Vector("terminais", {
        strategies: (function() {
        	if (localFeaturesTerminais) {
				return [
					new OpenLayers.Strategy.CenteredCluster({
					    autoActivate: true,
					    threshold: 2,
					    distance: 65
					})
					/*new OpenLayers.Strategy.AnimatedCluster({
						distance: 65,
						animationMethod: OpenLayers.Easing.Expo.easeOut,
						animationDuration: 20
					})*/
				];
			} else {
				return [
					new OpenLayers.Strategy.CenteredCluster({
					    autoActivate: true,
					    threshold: 2,
					    distance: 65
					}),
					new OpenLayers.Strategy.Fixed()
					/*new OpenLayers.Strategy.AnimatedCluster({
						distance: 65,
						animationMethod: OpenLayers.Easing.Expo.easeOut,
						animationDuration: 20
					})*/
				];
        		/*return [];
        	} else {
        		return [new OpenLayers.Strategy.Fixed()];*/
        	}
    	})()
    });
    mapaParadas.terminais = terminais;

    if (!localFeaturesTerminais) {
		console.log('Load [terminais] from remote server');

    	terminais.protocol = new OpenLayers.Protocol.HTTP({
            isBaseLayer: true,
            url: WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/estacao/geo/estacoes',
            format: new OpenLayers.Format.GeoJSON(),
            parseFeatures: function(data) {
            	var data = this.format.read(data.responseText);

            	for (var i = 0; i < data.length; i++) {
            		data[i].attributes.featureType = 'estacao';
            	}

            	return data;
            }
        });

        terminais.events.on({'loadend': function(e) {
	    	if (e.response.features && e.response.features.length > 0) {
	    		localStorage.setItem('terminais', new OpenLayers.Format.GeoJSON().write(e.response.features));
	    	}
	    }});
    }

    terminais.styleMap = mapa.styles.terminaisLayer;


	var localFeaturesBicicletarios = localStorage.getItem('bicicletarios');

    // Camada de bicicletários
    var bicicletarios = new OpenLayers.Layer.Vector('bicicletarios', {
		strategies: (function() {
			if (localFeaturesBicicletarios) {
				return [
					new OpenLayers.Strategy.CenteredCluster({
					    autoActivate: true,
					    threshold: 2,
					    distance: 65
					})
					/*new OpenLayers.Strategy.AnimatedCluster({
						distance: 65,
						animationMethod: OpenLayers.Easing.Expo.easeOut,
						animationDuration: 20
					})*/
				];
			} else {
				return [
					new OpenLayers.Strategy.CenteredCluster({
					    autoActivate: true,
					    threshold: 2,
					    distance: 65
					}),
					new OpenLayers.Strategy.Fixed()
					/*new OpenLayers.Strategy.AnimatedCluster({
						distance: 65,
						animationMethod: OpenLayers.Easing.Expo.easeOut,
						animationDuration: 20
					})*/
				];
			}
		})()
    });
    mapaParadas.bicicletarios = bicicletarios;

    if (!localFeaturesBicicletarios) {
		console.log('Load [bicicletarios] from remote server');

    	bicicletarios.protocol = new OpenLayers.Protocol.HTTP({
            isBaseLayer: true,
            url: WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/bicicletario/geo/bicicletarios',
            format: new OpenLayers.Format.GeoJSON(),
            parseFeatures: function(data) {
            	var data = this.format.read(data.responseText);

            	for (var i = 0; i < data.length; i++) {
            		data[i].attributes.featureType = 'bicicletario';
            	}

            	return data;
            }
        });

        bicicletarios.events.on({'loadend': function(e) {
	    	if (e.response.features && e.response.features.length > 0) {
	    		localStorage.setItem('bicicletarios', new OpenLayers.Format.GeoJSON().write(e.response.features));
	    	}
	    }});
    }

    bicicletarios.styleMap = mapa.styles.bicicletariosLayer;




    var localFeaturesPostos = localStorage.getItem('postos_sba');
	
	// Camada dos postos SBA
    var postos = new OpenLayers.Layer.Vector("postosSBA", {
        strategies: (function() {
        	if (localFeaturesTerminais) {
				return [
					new OpenLayers.Strategy.CenteredCluster({
					    autoActivate: true,
					    threshold: 2,
					    distance: 65
					})
					/*new OpenLayers.Strategy.AnimatedCluster({
						distance: 65,
						animationMethod: OpenLayers.Easing.Expo.easeOut,
						animationDuration: 20
					})*/
				];
			} else {
				return [
					new OpenLayers.Strategy.CenteredCluster({
					    autoActivate: true,
					    threshold: 2,
					    distance: 65
					}),
					new OpenLayers.Strategy.Fixed()
					/*new OpenLayers.Strategy.AnimatedCluster({
						distance: 65,
						animationMethod: OpenLayers.Easing.Expo.easeOut,
						animationDuration: 20
					})*/
				];
        		/*return [];
        	} else {
        		return [new OpenLayers.Strategy.Fixed()];*/
        	}
    	})()
    });
    mapaParadas.postos = postos;

    if (!localFeaturesPostos) {
		console.log('Load [postos_sba] from remote server');

    	postos.protocol = new OpenLayers.Protocol.HTTP({
            isBaseLayer: true,
            url: WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/postosba/geo/postos',
            format: new OpenLayers.Format.GeoJSON(),
            parseFeatures: function(data) {
            	var data = this.format.read(data.responseText);

            	for (var i = 0; i < data.length; i++) {
            		data[i].attributes.featureType = 'postosba';
            	}

            	return data;
            }
        });

        postos.events.on({'loadend': function(e) {
	    	if (e.response.features && e.response.features.length > 0) {
	    		localStorage.setItem('postos_sba', new OpenLayers.Format.GeoJSON().write(e.response.features));
	    	}
	    }});
    }

    postos.styleMap = mapa.styles.postosLayer;





	map.addLayer(mapaParadas.selectedsLayer);
    map.addLayer(paradas);

    if (localFeatures) {
    	console.log('Load [paradas] from localStorage: ' +  localFeatures.length);
    	paradas.addFeatures((new OpenLayers.Format.GeoJSON()).read(localFeatures));
	}
    map.addLayer(terminais);
    if (localFeaturesTerminais) {
    	console.log('Load [terminais] from localStorage: ' +  localFeaturesTerminais.length);
    	terminais.addFeatures((new OpenLayers.Format.GeoJSON()).read(localFeaturesTerminais));
	}
	map.addLayer(bicicletarios);
    if (localFeaturesBicicletarios) {
    	console.log('Load [bicicletarios] from localStorage: ' +  localFeaturesBicicletarios.length);
    	bicicletarios.addFeatures((new OpenLayers.Format.GeoJSON()).read(localFeaturesBicicletarios));
	}
	map.addLayer(postos);
    if (localFeaturesPostos) {
    	console.log('Load [postos_sba] from localStorage: ' +  localFeaturesPostos.length);
    	postos.addFeatures((new OpenLayers.Format.GeoJSON()).read(localFeaturesPostos));
	}


	// Desativa a strategie cluster de marcadores quando o zoom chega a 15
	var isClusterDisabled = false;
	map.events.register('zoomend', map, function () {
		var currentZoom = map.getZoom();
		
		if (!isClusterDisabled && currentZoom >= 17) {
			isClusterDisabled = true;
			paradas.strategies[0].deactivate();
		} else if (isClusterDisabled && currentZoom < 17) {
			isClusterDisabled = false;
			paradas.strategies[0].activate();
		}
    });
	
	// Evento de click sobre os features de cada layer
	[paradas, terminais, bicicletarios, postos, mapaParadas.selectedsLayer].forEach(function(layer) {
		layer.events.on({
	        'featureselected': mapaParadas.onFeatureClick/*,
	        'featureunselected': onFeatureUnselectMapaParadas*/
	    });	
	});


   	mapaParadas.controls = {};
	mapaParadas.controls.controlSelect = new OpenLayers.Control.SelectFeature([paradas, terminais, postos, bicicletarios, mapaParadas.selectedsLayer], {
		hover: true,
		highlightOnly: true,
		renderIntent: "temporary"
	});
    mapaParadas.controls.controlClick = new OpenLayers.Control.SelectFeature([paradas, terminais, postos, bicicletarios, mapaParadas.selectedsLayer], {
		clickout: true,
		renderIntent: "temporary"
	});

	OpenLayers.Control.Drag = OpenLayers.Class(OpenLayers.Control, {
	    defaultHandlerOptions: {'stopDown': false},
	    initialize: function(options) {
	        this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
	        OpenLayers.Control.prototype.initialize.apply(this, arguments); 
	        this.handler = new OpenLayers.Handler.Drag(this, {'down': this.onDown}, this.handlerOptions);
	    }, 
	    onDown: function(evt) {
	    	$('#pointAnimationParada').fadeOut();
	    }
	});
	mapaParadas.controls.touch = new OpenLayers.Control.Drag();

	/*
    OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
        defaultHandlerOptions: {
            'single': true,
            'double': false,
            'pixelTolerance': 0,
            'stopSingle': false,
            'stopDouble': false
        }, initialize: function(options) {
            this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
            OpenLayers.Control.prototype.initialize.apply(this, arguments); 
            this.handler = new OpenLayers.Handler.Click(this, {'click': this.trigger}, this.handlerOptions);
        }, trigger: function(e) {	// Evento de click no map
            $('#pointAnimationParada').fadeOut();
        }
    });
    mapaParadas.controls.mapClick = new OpenLayers.Control.Click();*/

    [/*mapaParadas.controls.mapClick,*/ mapaParadas.controls.touch, mapaParadas.controls.controlSelect, mapaParadas.controls.controlClick].forEach(function(c) {
    	map.addControl(c);
    	c.activate();
    });

    $('#mapa-parada').on('touchstart', function() {
		$('#pointAnimationParada').fadeOut();
    });


    map.setCenter(new OpenLayers.LonLat(-5324737.808158, -1778196.485318), 12);

    // Requisita a localização do usuário no mapa
    if (!isLocationDisabled) {
    	mapaParadas.requestLocation();
	}
}

// Configura um conjunto de linhas referentes a um número pequisado
function setLinhas(linhas) {
	if (linhaSelecionada) {	// Existe uma linha já selecionada pelo lista
		var linha = linhas.filter(function(linha) {	
			return linha.sequencial == linhaSelecionada.sequencial;
		});
		
		var enableAlternador = false;
		
		if (linha.length == 1) {	// A linhaSelecionada está na lista
			linha = linha[0];
			
			if (linha.sentido != 'CIRCULAR') {	// Busca linha de sentido oposto
				var linhaOposta = getLinhaSentido(linhas, linha.sentido == 'IDA' ? 'VOLTA' : 'IDA');
			
				if (linhaOposta != null) {	// Lista com linha e seu sentido oposto
					linhaPesquisada.linhas = [linha, linhaOposta];
					enableAlternador = true;
				}
			}
		} else {	// Linha não está presente na lista, exibir apenas ela.
			linha = linhaSelecionada;
		}
		
		setLinha(linha);
		enableAlternadorSentido(enableAlternador);
	} else {
		linhas = filtrarSentidos(linhas);
		
		// Conjunto IDA e VOLTA válido
		if (linhas.length == 2 && ((linhas[0].sentido == 'IDA' && linhas[1].sentido == 'VOLTA') || (linhas[0].sentido == 'VOLTA' && linhas[1].sentido == 'IDA'))) {
			linhaPesquisada.linhas = linhas;
			
			if (linhas[1].sentido == 'IDA') {	// Preferência para visualização do sentido IDA
				setLinha(linhas[1]);
			} else {
				setLinha(linhas[0]);
			}
			
			// Exibe o alternador de sentido
			enableAlternadorSentido(true);
		} else if (linhas.length == 1) {
			setLinha(linhas[0]);
			enableAlternadorSentido(false);
		}
	}

	setPontoOrigemHorario(undefined);
	setPontoOrigemDestinoItinerario(undefined);
	// Desativação do switch de integração por default
	enableAlternadorLinhaIntegracao(false);
}

// Configura uma linha atualmente pesquisada
function setLinha(linha) {
	linhaPesquisada.linha = linha;
	
	var div = document.getElementById('linha_cod');
	div.innerHTML = linha.numero;
					
	div = document.getElementById('linha_nome');
	div.innerHTML = linha.descricao;
	
	div = document.getElementById('linha_tarifa');
	if (linha.faixaTarifaria) {
		div.innerHTML = 'R$ ' + Number(linha.faixaTarifaria.tarifa).toFixed(2);
	} else {
		div.innerHTML = '';
	}
	
	div = document.getElementById('linha_operadores');
	if (linha.operadoras && linha.operadoras.length > 0) {
		var value = '';
		
		linha.operadoras.forEach(function(operadora) {
			var nome = operadora.nome;

			if (nome.toUpperCase().indexOf('MARECHAL') != -1) {
				nome = 'MARECHAL';
			} else if (nome.toUpperCase().indexOf('PIRACICABANA') != -1) {
				nome = 'PIRACICABANA';
			} else if (nome.toUpperCase().indexOf('PIONEIRA') != -1) {
				nome = 'PIONEIRA';
			} else if (nome.toUpperCase().indexOf('URBI') != -1) {
				nome = 'URBI';
			} else if (nome.toUpperCase().indexOf('SÃO JOSÉ') != -1) {
				nome = 'SÃO JOSÉ';
			}

			value += nome + ' / ';
		});
		
		if (linha.operadoras.length > 0) {
			div.innerHTML = value.slice(0, value.length - 3);
		}
	} else {
		display_div('linha_operadores', 'none');
	}
	
	display_div('info_horario', 'none');
	display_div('info_itinerario', 'none');
	display_div('divMapaLinha', 'inline-block');

	// Bug workaround: esperar a página acoplar o mapa
	setTimeout(function() {
		loadLinhaPercurso(linha);
	}, 100);
	
	
	// Ativa o speech da linha pesquisada
	if (isSpeech) {
		speechResumoLinha();
		speechLinhaComando();
	}
}

// Executada quando uma linha é selecionada na lista.
function onLinhaSelecionadaLista(linha) {
	linhaSelecionada = linha;
	
	M.loading.showTop();
	pesquisaLinhaByNumero(linha.numero, function(data) {
		render('#linha');
		setLinhas(data);
		pesquisaItinerario();
		pesquisaHorarios();
	}, function() {
		M.loading.hideTop();
	});
}

// Realiza o filtro da listagem de linhas
function filtrarListaLinhas(value) {
	M.listaLinhas[tipoLista].onFilter(value);
}

// Realiza o agrupamento de linhas duplicadas e com mais de uma sentido numa lista.
function reduceListaLinhas(linhas) {
	if (linhas) {
		var map = new Map();

		linhas.forEach(function(linha) {
			var list = map.get(linha.numero);

			if (list) {
				var isIn = false;

				for (var i = 0; i < list.length; i++) {
					if (list[i].descricao == linha.descricao) {
						isIn = true;
						break;
					}
				}

				if (!isIn) {
					list.push(linha);
				} else {
					// Preferência para o sentido IDA
					if (list.length == 1 && list[0].sentido == 'VOLTA' && linha.sentido == 'IDA') {
						list[0] = linha;
					}
				}
			} else {
				map.set(linha.numero, []);
				map.get(linha.numero).push(linha);
			}
		});

		var novasLinhas = [];

		map.forEach(function(list) {
			novasLinhas = novasLinhas.concat(list);
		});

		return novasLinhas;
	}
}

// Configura a lista de linhas pesquisadas.
function setListaLinhas(linhas) {
	if (!linhas || linhas.length == 0) {
		M.messages.showInfo('<-> nenhuma linha encontrada.');
	}

	$('#containerLinhasLista').show();
	$('#containerIntegracao').hide();

	linhas = reduceListaLinhas(linhas);
	
	listaLinhas = linhas;
	
	if (tipoLista == undefined || M.listaLinhas[tipoLista] == undefined) {
		tipoLista = Object.keys(M.listaLinhas)[0];
	}
	
	M.listaLinhas[tipoLista].setLinhas(linhas);
	var sortProperty = $('#containerLinhas .lista_linhas_select_ordenacao').val();
	if (!sortProperty) {
		sortProperty = 'faixaTarifaria.tarifa'; 
		$('#containerLinhas .lista_linhas_select_ordenacao').val(sortProperty);
	}
	M.listaLinhas[tipoLista].orderBy(sortProperty);
	
	// Configura função de filtro nas linhas
	linhas.forEach(function(linha) {
		linha.filterString = (linha.numero + linha.descricao + linha.sentido).toLowerCase();
		linha.filterString = M.diacritics.removeDiacritics(linha.filterString);
		linha.filtrar = function(filterValue) {
			return this.filterString.indexOf(filterValue) != -1;
		}

		linha.speechText = function() {	// Resumo da linha para speech
			return 'Linha número ' + this.numero.replace('.', ' ponto ') + ', ' + linha.descricao + '. ';
		};
		currentListaLinhas.push(linha);
	});
	
	// Configura evento de filtro da lista de linhas
	var $filtroLinhas = $('#filtroLinhas');
	$filtroLinhas.keyup(function() {
		filtrarListaLinhas($filtroLinhas.val());
	});

	// Configura evento de ordenação da lista
	$('#containerLinhas .lista_linhas_select_ordenacao').on('change', function() {
		M.listaLinhas[tipoLista].orderBy(this.value);
	});

	// Ativa o speech da listagem
	if (isSpeech) {
		speechListaLinhasQuantidade();
		speechListaLinhasComando();
	}
}

// Configura a lista horária da linha atualmente pesquisada.
function setLinhaHorarios(listasHorarias) {	
	linhaPesquisada.horarios = SENTIDOS.map(function(sentido) {
		// Lista respectiva ao sentido
		var listaSentido = listasHorarias.filter(function(lista) {
			return lista.sentido == sentido;
		})[0];
		
		if (listaSentido) {
			return {
				label: sentido,
				diasSemana: getDiasSemanaArray(listaSentido.horarios),
				tempoMedio: listaSentido.duracaoMedia,
				// Obtem o tempo médio formatado
				getTempoMedioFormatado: function() {
					var horas;
					var minutos = this.tempoMedio;
					
					if (this.tempoMedio > 59) {
						horas = String(parseInt(this.tempoMedio / 60));
						minutos -= horas * 60;
					} else {
						horas = '00';
					}
					
					if (horas.length == 1) {
						horas = '0' + horas;
					}

					if (String(minutos).length == 1) {
						minutos = '0' + String(minutos);
					}
					
					return horas + ':' + minutos;
				},
				// Obtem uma label com as iniciais dos dias da semana onde a linha possue horários.
				getDiasLabel: function () {
					var label = '';
					
					this.diasSemana.forEach(function(dia) {
						if (dia.count > 0) {
							if (dia.isSegSexta) {
								label += ' SEG-SEXTA';
							} else {
								label += ' ' + dia.label.substring(0, 3);
							}
						}
					});
					
					return label;
				},
				// Obtem o primeiro e último horários do itinerário horário.
				getIntervalo: function() {
					var i = 0;
					
					for (; i < this.diasSemana.length; i++) {
						if (this.diasSemana[i].count > 0) {
							break;
						}
					}
					
					if (i < this.diasSemana.length) {
						var dia = this.diasSemana[i];
						var turno = undefined;
						
						for (i = 0; i < dia.turnos.length; i++) {
							if (dia.turnos[i].horarios.length > 0) {
								turno = dia.turnos[i];
								break;
							}
						}
						
						if (turno) {
							return turno.horarios[0].horario + ' - ' + turno.horarios[turno.horarios.length-1].horario;
						}
					}
					
					return '';
				},
				// Contabiliza a quantidade de partidas no primeiro dia da semana do itinerário da linha com horários.
				getPartidas: function() {
					var i = 0;
					
					for (; i < this.diasSemana.length; i++) {
						if (this.diasSemana[i].count > 0) {
							break;
						}
					}
					
					if (i < this.diasSemana.length) {
						var dia = this.diasSemana[i];
						
						return dia.turnos.reduce(function(total, turno) {
							return total + turno.horarios.length;
						}, 0);
					}
					
					return '';
				}
			};
		}
	});
	
	// Remoção de sentidos sem horários.
	linhaPesquisada.horarios = linhaPesquisada.horarios.filter(function(horariosSentido) {
		return horariosSentido && horariosSentido.diasSemana && horariosSentido.diasSemana.length > 0;
	});
}

// Configura a lista de itinerários da linha atualmente pesquisada.
function setLinhaItinerarios(itinerarios) {
	linhaPesquisada.itinerarios = itinerarios;
}

// Mostra o itinerário para um determinado sentido.
function loadItinerarioSentido(sentido) {
	if (linhaPesquisada.itinerarios) {		
		var itinerarios = linhaPesquisada.itinerarios.filter(function(it) {
			return it.sentido == sentido;
		});
		
		if (itinerarios) {
			gerarItinerarios(itinerarios);
		
			loadItinerariosResumo(itinerarios[0]);
		}
	}
}

// Mostra a árvore horário para um determinado sentido.
function loadHorariosSentido(sentidoLinha) {
	if (linhaPesquisada.horarios) {
		var sentido = linhaPesquisada.horarios.filter(function(horariosSentido) {
			return horariosSentido.label == sentidoLinha;
		});
		
		if (sentido) {
			gerarArvoreHoraria(sentido, isHorizontalHorarioTree);
			
			loadHorariosResumo(sentido[0]);
		}
	}
}

// Atualiza o bloco de resumo horário a partir dos horários de um sentido.
function loadHorariosResumo(horarioSentido) {
	var sentido = '', dias = '', tempoMedio = '', partidas = '';
	
	if (horarioSentido) {
		sentido = horarioSentido.label;
		dias = horarioSentido.getDiasLabel();
		tempoMedio = horarioSentido.getTempoMedioFormatado();
		partidas = horarioSentido.getPartidas();
	}
	
	var div = document.getElementById('resumoHorarioSentido');
	div.innerHTML = sentido;

	div = document.getElementById('resumoHorarioDias');
	div.innerHTML = dias;
	
	if (tempoMedio && tempoMedio.indexOf('null') == -1) {
		div = document.getElementById('resumoHorarioTempoMedio');
		div.innerHTML = tempoMedio;
	} else {
		$('#lblDuracaoMedia').css('display', 'none');
	}
	
	div = document.getElementById('resumoHorarioPartidas');
	div.innerHTML = partidas;
}

// Atualiza o bloco de resumo de itinerário a partir dos itinerários de um sentido.
function loadItinerariosResumo(itinerarioSentido) {
	var sentido = '', extensao = '', trechos = '', origem = '', destino = '';
	
	if (itinerarioSentido) {
		sentido = itinerarioSentido.sentido;
		extensao = itinerarioSentido.extensao;
		trechos = itinerarioSentido.itinerario.length;
		origem = itinerarioSentido.origem;
		destino = itinerarioSentido.destino;
	}
	
	var div = document.getElementById('resumoItinerarioSentido');
	div.innerHTML = sentido;
	
	div = document.getElementById('resumoItinerarioExtensao');
	div.innerHTML = extensao + (extensao ? ' km' : '');
	
	div = document.getElementById('resumoItinerarioTrechos');
	div.innerHTML = trechos;
	
	div = document.getElementById('resumoItinerarioOrigem');
	div.innerHTML = origem;
	
	div = document.getElementById('resumoItinerarioDestino');
	div.innerHTML = destino;
		
	if (sentido != 'CIRCULAR') {
		display_div('resumoItinerarioOriDest', 'block');
		display_div('resumoItinerarioOriDestDest', 'block');
	} else {
		//display_div('resumoItinerarioOriDest', 'none');
		display_div('resumoItinerarioOriDestDest', 'none');
	}

	setPontoOrigemHorario(origem);
	setPontoOrigemDestinoItinerario(origem, destino);
}

// Configura o ponto de origem na árvore de horários.
function setPontoOrigemHorario(pontoOrigem) {
	var value = document.getElementById('horarioPontoOrigemValue');

	if (pontoOrigem) {
		$('#horarioPontoOrigem').show();
		value.innerHTML = pontoOrigem;
	} else {
		$('#horarioPontoOrigem').hide();
	}
}

// Configura pontos de origem e destino no painel do itinerário descritivo.
function setPontoOrigemDestinoItinerario(pontoOrigem, pontoDestino) {
	if (pontoOrigem && pontoDestino) {
		$('#itinerarioPontoOrigemDestino').show();

		var value = document.getElementById('itinerarioPontoOrigemValue');
		value.innerHTML = pontoOrigem;
		value = document.getElementById('itinerarioPontoDestinoValue');
		value.innerHTML = pontoDestino;
	} else {
		$('#itinerarioPontoOrigemDestino').hide();
	}
}


/*** CONSULTAS AJAX ***/

// Pesquisa uma linha pelo seu número
function pesquisaLinhaByNumero(numeroLinha, onSucceed, onFinally) {
	// TESTE
	//onSucceed([{sequencial: 42,numero: '099.1', sentido: 'IDA', descricao: 'Cruzeiro/Tag. Sul - Sia', faixaTarifaria: {tarifa: '3.50'}, operadoras: [{nome: 'Urbi'}, {nome: 'Auto Viacao Sao Jose'}] }]);
	//onFinally();
	//return;
	////////
	
	$.get(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/linha/numero/'+numeroLinha, function(data, status) {
		if (status == 'success') {
			onSucceed(data);
		} else {
			console.log('<!> Consulta de linha nao sucedida: ' + status + ' - linha: ' + numeroLinha);
			M.messages.showWarn('<!> consulta de linha nao sucedida: ' + status);
		}
	}).fail(function() {
		M.messages.showError('<#> erro de conexao ao consultar linha :(');
		console.log('<#> erro de conexao ao consultar linha por número: ' + numeroLinha);
	}).complete(function() {
		if (onFinally) {
			onFinally();
		}
	});
}

// Pesquisa linhas por referência
function pesquisarLinhasByRef(tipoOrigem, seqOrigem, tipoDestino, seqDestino, onSucceed, onFinally) {
	$.get(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/linha/' + tipoOrigem + '/' + seqOrigem + '/' + tipoDestino + '/' + seqDestino, function(data, status) {
		if (status == 'success') {
			onSucceed(data);
		} else {
			console.log('<!> consulta de linhas por referência não sucedida: ' + status + ' - ' + tipoOrigem + ':' + seqOrigem + ' - ' + tipoDestino + ':' + seqDestino);
			M.messages.showWarn('<!> consulta de linhas não sucedida :(');
		}
	}).fail(function() {
		M.messages.showError('<#> erro de conexao ao consultar linhas :(');
		console.log('<#> erro de conexao ao pesquisar linhas por referência.');
	}).complete(function() {
		if (onFinally) {
			onFinally();
		}
	});
}

// Pesquisa os horários de uma linha
function pesquisaHorarios() {
	var linha = linhaPesquisada.linha;
	
	if (!(linha && linha.numero)) {
		return;
	}
	
	M.loading.showHorario();

	pesquisaHorariosByNumeroLinha(linha.numero, function(data) {
		// Armazena a lista horária pesquisada
		setLinhaHorarios(data);
		
		// Manda gerar a árvore horário só para o sentido da linha
		loadHorariosSentido(linha.sentido);
	}, function() {
		M.loading.hideHorario();
	});
}

// Pesquisa os horários de uma linha
function pesquisaHorariosByNumeroLinha(numeroLinha, onSucceed, onFinally) {
	$.get(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/horario/linha/numero/' + numeroLinha, function(data, status) {
		if (status == 'success') {
			onSucceed(data);
		} else {
			console.log('<!> Consulta de horarios nao sucedida: ' + status + ' - linha: ' + numeroLinha);
			M.messages.showWarn('<!> consulta de horarios nao sucedida: ' + status);
		}
	}).fail(function() {
		M.messages.showError('<#> erro de conexao ao consultar horarios :(');
    	console.log('<#> erro ao carregar horarios da linha: ' + numeroLinha);
  	}).complete(function() {
		if (onFinally) {
			onFinally();
		}
	});
}

// Pesquisa os horários de uma linha identificado pelo seu sequencial
function pesquisaHorariosBySequencialLinha(seqLinha, onSucceed, onFinally) {
	$.get(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/horario/linha/' + seqLinha, function(data, status) {
		if (status == 'success') {
			onSucceed(data);
		} else {
			console.log('<!> Consulta de horarios nao sucedida: ' + status + ' - linha: ' + seqLinha);
			M.messages.showWarn('<!> consulta de horarios nao sucedida: ' + status);
		}
	}).fail(function() {
		M.messages.showError('<#> erro de conexao ao consultar horarios :(');
    	console.log('<#> erro ao carregar horarios da linha: ' + seqLinha);
  	}).complete(function() {
		if (onFinally) {
			onFinally();
		}
	});	
}

// Pesquisa o itinerário descritivo de uma linha
function pesquisaItinerario() {
	var linha = linhaPesquisada.linha;
	
	if (!(linha && linha.numero)) {
		return;
	}

	// TESTE
	/*setLinhaItinerarios([{sentido: 'IDA'  , itinerario: [{sequencial: 1, via: 'DF 42', localidade: 'DF'}, {sequencial: 2, via: 'QNQ 42', localidade: 'DF'}]},
					  {sentido: 'VOLTA', itinerario: [{sequencial: 1, via: 'BR 42', localidade: 'DF'}, {sequencial: 2, via: 'CNJ 42', localidade: 'DF'}]}]);
	gerarItinerarios(linhaPesquisada.itinerarios.filter(function(it) {
		return it.sentido == linha.sentido;
	}));
	return;*/
	////////
	
	M.loading.showItinerario();

	$.get(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/itinerario/linha/numero/' + linha.numero, function(data, status) {
		if (status == 'success') {
			// Armazena a lista de itinerários pesquisada
			setLinhaItinerarios(data);

			// Manda gerar a lista de itinerários só para o sentido da linha
			loadItinerarioSentido(linha.sentido);
		} else {
			console.log('<!> Consulta de itinerario nao sucedida: ' + status + ' - linha: ' + linha.numero);
			M.messages.showWarn('<!> consulta de itinerario nao sucedida: ' + status);
		}
	}).fail(function() {
		M.messages.showError('<#> Erro de conexao ao consultar itinerario :(');
		console.log('<#> Erro ao pesquisar itinerario da linha: ' + linha.numero);
  	}).complete(function() {
		M.loading.hideItinerario();
	});
}

// Pesquisa referências com base em um filtro.
function pesquisaReferenciasLike(filterValue, onSucceed) {
	//onSucceed([{tipo: 'ra', id: 4}]);
	//return;

	filterValue = filterValue.replace('/', '%26%2347%3B'); //HTML entity para o caracter '/': &#47;
	
	$.get(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/referencia/find/' + filterValue, function(data, status) {
		if (status == 'success') {
			data.forEach(function(ref) {
				ref.id = ref.sequencialRef;
			});
			
			onSucceed(data);
		} else {
			console.log('<!> consulta de referencias nao sucedida: ' + status);
			M.messages.showWarn('<!> consulta de referências não sucedida.');
		}
	}).fail(function() {
		M.messages.showError('<#> erro de conexao ao consultar referências :(');
		console.log('<#> erro ao carregar referências para pesquisa: ' + filterValue);
	});
}

// Pesquisa linhas com base em um filtro
function pesquisaLinhasLike(filterValue, onSucceed, onFinally, limiteResultados, isLongForm) {
	if (!limiteResultados) {
		limiteResultados = LIMIT_SUGESTOES_LINHA;
	}

	var short = '/short';
	if (isLongForm) {
		short = '';
	}

	//HTML entity para o caracter '/': &#47;
	filterValue = filterValue.replace('/', '%26%2347%3B');
	
	$.get(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/linha/find/' + filterValue + '/' + limiteResultados + short, function(data, status) {
		if (status == 'success') {
			onSucceed(data);
		} else {
			console.log('<!> consulta de sugestões de linhas não sucedida: ' + status);
			M.messages.showWarn('<!> consulta de linhas não sucedida.');
		}
	}).fail(function() {
		console.log('<#> erro ao carregar sugestões de linhas: ' + filterValue);
		M.messages.showError('<#> erro de conexao ao consultar linhas :(');
	}).complete(function() {
		if (onFinally) {
			onFinally();
		}
	});
}

// Pesquisa as linhas referentes a uma parada identificada pelo seu código.
function pesquisaLinhasByCodParada(codParada, onSucceed, onFinally) {
	$.get(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/linha/parada/codigo/' + codParada, function(data, status) {
		if (status == 'success') {
			onSucceed(data);
		} else {
			console.log('<!> consulta de linhas por parada não sucedida: ' + status + ' - ' + codParada);
			M.messages.showWarn('<!> consulta de linhas por parada não sucedida :(');
		}
	}).fail(function() {
		M.messages.showError('<#> erro de conexão ao consultar linhas :(');
		console.log('<#> erro de conexao ao pesquisar linhas por parada.');
	}).complete(function() {
		if (onFinally) {
			onFinally();
		}
	});
}

// Pesquisa uma estação pelo seu sequencial
function pesquisarEstacao(seqEstacao, onSucceed, onFinally) {
	$.get(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/estacao/' + seqEstacao, function(data, status) {
		if (status == 'success') {
			onSucceed(data);
		} else {
			console.log('<!> consulta de terminal não sucedida: ' + status + ' - ' + seqEstacao);
			M.messages.showWarn('<!> consulta de terminal não sucedida :(');
		}
	}).fail(function() {
		M.messages.showError('<#> erro de conexão ao consultar terminal :(');
		console.log('<#> erro de conexão ao pesquisar terminal.');
	}).complete(function() {
		if (onFinally) {
			onFinally();
		}
	});
}

// Pesquia uma parada pelo seu código.
function pesquisarParadaByCod(codParada, onSucceed, onFinally) {
	$.get(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/parada/cod/' + codParada, function(data, status) {
		if (status == 'success') {
			onSucceed(data);
		} else {
			console.log('<!> consulta de parada não sucedida: ' + status + ' - ' + código);
			M.messages.showWarn('<!> consulta de parada não sucedida :(');
		}
	}).fail(function() {
		M.messages.showError('<#> erro de conexão ao consultar parada :(');
		console.log('<#> erro de conexão ao pesquisar parada por código.');
	}).complete(function() {
		if (onFinally) {
			onFinally();
		}
	});
}

// Pesquisa as linhas referentes a uma estação identificada pelo seu sequencial.
function pesquisaLinhasBySeqEstacao(seqEstacao, onSucceed, onFinally) {
	$.get(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/linha/estacao/' + seqEstacao, function(data, status) {
		if (status == 'success') {
			onSucceed(data);
		} else {
			console.log('<!> consulta de linhas por estação não sucedida: ' + status + ' - ' + seqEstacao);
			M.messages.showWarn('<!> consulta de linhas por terminal não sucedida :(');
		}
	}).fail(function() {
		M.messages.showError('<#> erro de conexão ao consultar linhas :(');
		console.log('<#> erro de conexao ao pesquisar linhas por terminal.');
	}).complete(function() {
		if (onFinally) {
			onFinally();
		}
	});
}

// Pesquisa os horários de uma parada referentes a uma linha em um dado sentido e dia de operação.
function pesquisarHorariosParada(codParada, numLinha, sentido, diaSemana, onSucceed, onFinally, onFail) {
	$.get(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/horarioparada/' + codParada + '/' + numLinha + '/' + sentido + '/' + diaSemana, function(data, status) {
		if (status == 'success') {
			onSucceed(data);
		} else {
			console.log('<!> consulta de horários de parada não sucedida: ' + status + ' - paradaCod:' + codParada
			 																			+ ' - linha:' + numLinha 
			 																			+ ' - sentido:' + sentido
			 																		    + ' - diaSemana:' + diaSemana);
			M.messages.showWarn('<!> consulta de horários de parada não sucedida :(');

			if (onFail) {
				onFail();
			}
		}
	}).fail(function() {
		M.messages.showError('<#> erro de conexão ao consultar horários de paradas :(');
		console.log('<#> erro de conexão ao pesquisar horários de parada.');

		if (onFail) {
			onFail();
		}
	}).complete(function() {
		if (onFinally) {
			onFinally();
		}
	});
}

// Pesquisa as integrações possíveis para duas referências
function pesquisarIntegracoes(tipoOrigem, seqOrigem, tipoDestino, seqDestino, onSucceed, onFinally) {
	$.get(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/integracao/' + tipoOrigem + '/' + seqOrigem + '/' + tipoDestino + '/' + seqDestino, function(data, status) {
	//$.get('/integracao.json', function(data, status) {
		if (status == 'success') {
			onSucceed(data);
		} else {
			console.log('<!> consulta de integrações por referência não sucedida: ' + status + ' - ' + tipoOrigem + ':' + seqOrigem + ' - ' + tipoDestino + ':' + seqDestino);
			M.messages.showWarn('<!> consulta de integrações não sucedida :(');
		}
	}).fail(function() {
		M.messages.showError('<#> erro de conexão ao consultar integrações :(');
		console.log('<#> erro de conexão ao pesquisar integrações.');
	}).complete(function() {
		if (onFinally) {
			onFinally();
		}
	});
}

// Pesquisa as áreas de integração possíveis para duas referências
function pesquisarAreasIntegracoes(tipoOrigem, seqOrigem, tipoDestino, seqDestino, onSucceed, onFinally) {
	$.get(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/areaintegracao/' + tipoOrigem + '/' + seqOrigem + '/' + tipoDestino + '/' + seqDestino, function(data, status) {
		if (status == 'success') {
			onSucceed(data);
		} else {
			console.log('<!> consulta por áreas de integração por referência não sucedida: ' + status + ' - ' + tipoOrigem + ':' + seqOrigem + ' - ' + tipoDestino + ':' + seqDestino);
			M.messages.showWarn('<!> consulta por áreas de integração não sucedida :(');
		}
	}).fail(function() {
		M.messages.showError('<#> erro de conexão ao consultar integrações :(');
		console.log('<#> erro de conexão ao pesquisar integrações.');
	}).complete(function() {
		if (onFinally) {
			onFinally();
		}
	});
}

// Pesquisa uma rota entity
function pesquisarRotaEntity(tipo, sequencial, onSucceed, onFinally) {
	$.get(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/rotaentity/' + tipo + '/' + sequencial, function(data, status) {
		if (status == 'success') {
			onSucceed(data);
		} else {
			console.log('<!> consulta por entidade não sucedida: ' + status + ' - ' + tipo + ':' + sequencial);
			M.messages.showWarn('<!> consulta por entidade não sucedida :(');
		}
	}).fail(function() {
		M.messages.showError('<#> erro de conexão ao consultar entidade :(');
		console.log('<#> erro de conexão ao pesquisar entidade.');
	}).complete(function() {
		if (onFinally) {
			onFinally();
		}
	});
}

// Pesquisa última carga de dados
function pesquisarUltimaCarga(onSucceed, onFinally) {
	$.get(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/carga/ultima', function(data, status) {
		if (status == 'success') {
			onSucceed(data);
		} else {
			console.log('<!> consulta por última carga de dados não sucedida: ' + status + ' - ' + tipoOrigem + ':' + seqOrigem + ' - ' + tipoDestino + ':' + seqDestino);
		}
	}).fail(function() {
		console.log('<#> erro de conexão ao pesquisar última carga.');
	}).complete(function() {
		if (onFinally) {
			onFinally();
		}
	});
}

// Registra localização
function postLocation(position) {
	if (POST_LOCATION) {
		var obj = {'id': generateUserId(),
					'lon': position.coords.longitude,
					'lat': position.coords.latitude,
					'time': position.timestamp,
					'mobile': String(checkIfMobile())};

		if (position.coords.speed != null) {
			obj['speed'] = position.coords.speed;
		}

		$.post(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/localizacao', toQueryString(obj));
	} else {
		console.log('POST LOCATION SUPRESS');
	}
}

/******** ALTERAÇÃO DE VISUALIZAÇÃO *********/



// Atende ao evento de deseleção de ponto no mapa de paradas (click em área vazia)
function onFeatureUnselectMapaParadas(evt) {
	if (mapaParadas && mapaParadas.map && mapaParadas.map.controls) {
		mapaParadas.map.controls[mapaParadas.map.controls.length-1].unselectAll();
	}
	$('#mapa-parada-dialogo').animate({width: 'hide'}, 200, 'linear');

	$('#btnShowMapDialog').animate({width: 'show'}, 200, 'linear');
}

// Mostra/oculta o alternador de sentido.
function enableAlternadorSentido(enable) {
	if (enable) {
		change_sentido_radio('radioSentidoContainer', linhaPesquisada.linha.sentido);
		display_div('radioSentidoContainer', 'inline-block');
	} else {
		display_div('radioSentidoContainer', 'none');
	}
}

// Mostra/oculta o alternador de linha da integração.
function enableAlternadorLinhaIntegracao(enable) {
	if (enable) {
		display_div('radioSwitchIntegracao', 'inline-block');
	} else {
		display_div('radioSwitchIntegracao', 'none');
	}
}

// Mostra o bloco de horários da linha
function showHorariosLinha() {
	if (!('horarios' in linhaPesquisada)) {
		pesquisaHorarios(linhaPesquisada);
	}
	display_div("info_horario", "block");
}

// Mostra o bloco de itinerário da linha
function showItinerarioLinha() {
	if (!('itinerarios' in linhaPesquisada)) {
		pesquisaItinerario(linhaPesquisada);
	}
	display_div("info_itinerario", "block");
}

// Configura um título para a lista de linhas
function setListaLinhasTitulo(titulo) {
	$('#containerLinhas .lista_linhas_titulo').text(titulo.toUpperCase());
}

// Ativa/desativa o modo fullscreen do mapa de paradas
function fullscreenMapaParadas(evt) {
	if (evt) {
		evt.preventDefault();
	}

	//var $btnClose = $('.mapa_btn_close');

	// Decide se o mapa será levado ao fullscreen ou o contrário pelo estado do botão fechar
	var isToFullScreen = true;
	//if ($btnClose.hasClass('mapa_btn_close_fullscreen')) {
	if ($(evt.target).attr('src') == 'img/fullscreen_exit.png') {
		isToFullScreen = false;
	}

	// Leva o mapa ao tamanho da tela por posição fixa
	var mapDiv = document.getElementById('mapa-parada');
	if (mapDiv) {
		mapDiv.style.position =  isToFullScreen ? 'fixed' : 'absolute';
	}

	// Imagem do botão de fullscreen
	var imgBtnFullscreen = isToFullScreen ? 'img/fullscreen_exit.png' : 'img/fullscreen.png';
	
	// Motifica estado do botão fechar
	/*if (isToFullScreen) {
		$btnClose.removeClass('mapa_btn_close_screen');
		$btnClose.addClass('mapa_btn_close_fullscreen');
	} else {
		$btnClose.removeClass('mapa_btn_close_fullscreen');
		$btnClose.addClass('mapa_btn_close_screen');
	}*/

	$('#mapa-parada > .mapa_btn_fullscreen').find('img').attr('src', imgBtnFullscreen);
	mapaParadas.map.updateSize(); // Atualiza tamanho do mapa
}

// Ativa/desativa o modo fullscreen do mapa de linha
function fullscreenMapaLinha(evt) {
	if (evt) {
		evt.preventDefault();	
	}

	var $container = $('.mapa_percurso_container');

	var isToFullScreen = true;
	if ($container.hasClass('mapa_percurso_container_fullscreen')) {
		isToFullScreen = false;
	}

	// Motifica estado do botão fechar
	if (isToFullScreen) {
		$container.removeClass('mapa_percurso_container_screen');
		$container.addClass('mapa_percurso_container_fullscreen');
	} else {
		$container.removeClass('mapa_percurso_container_fullscreen');
		$container.addClass('mapa_percurso_container_screen');
	}

	// Imagem do botão de fullscreen
	var imgBtnFullscreen = isToFullScreen ? 'img/fullscreen_exit.png' : 'img/fullscreen.png';

	$container.find('.mapa_btn_fullscreen > img').attr('src', imgBtnFullscreen);
	mapaPercurso.map.updateSize();
}

// Centraliza o mapa de paradas sobre o ponto definido como origem
function mapaParadasOrigemCenter() {
	mapaParadas.centerToOrigem();
}

// Centraliza o mapa de paradas sobre o ponto definido como destino
function mapaParadasDestinoCenter() {
	mapaParadas.centerToDestino();	
}

// Configura os features selecionados
function setSelectedsLayerFeatures(features) {
	// Remove o estado se seleção sobre o feature
	mapaParadas.controls.controlClick.unselectAll();

	// Remove os features de suas respectivas layers mantendo uma referência a mesma
	features.forEach(function(f) {
		if (f.layer && f.layer != mapaParadas.selectedsLayer) {
			f.oldLayer = f.layer;
			f.layer.removeFeatures(f);
		}
	});

	var featuresAtuais = mapaParadas.selectedsLayer.features;

	// Remove features atuais e adiciona o array de novos
	mapaParadas.selectedsLayer.removeAllFeatures();	
	mapaParadas.selectedsLayer.addFeatures(features);

	// Devolve os features atuais para suas respectivas layers antigas
	featuresAtuais.forEach(function(f) {
		if (f.oldLayer && f.layer != mapaParadas.selectedsLayer) {
			f.oldLayer.addFeatures(f);
		}
	});
}

// Configura a parada apresentada como origem ou destino
function setCurrentParadaAs(value) {
	var featureSelected = mapaParadas.selectedFeature;

	if (featureSelected) {
		change_sentido_radio('radioParadaContainer', value);

		var $inputs = $('.form_parada_' + value);
		var $opostos;

		if (value == 'origem') {
			$opostos = $('.form_parada_destino');
		} else if (value == 'destino') {
			$opostos = $('.form_parada_origem');
		}
		
		var num = (featureSelected.attributes.featureType == 'parada') ? featureSelected.attributes.codDftrans : featureSelected.attributes.sequencial;
		
		// Código da parada selecionada já está presente no campo oposto...
		if ($opostos.val() == num) {
			if ($inputs.val()) {	// Faz troca de valores entre os campos orgem/destino
				$opostos.val($inputs.val());
			} else {	// Remoção do código da parada do campo oposto caso exista
				$opostos.val('');
			}
		}
		
		$inputs.val(num);


		if (value == 'origem') {
			mapaParadas.setOrigemFeature(featureSelected);
		} else {
			mapaParadas.setDestinoFeature(featureSelected);
		}

		setSelectedsLayerFeatures([mapaParadas.origemFeature, mapaParadas.destinoFeature].filter(function(f) {
			return f != undefined;
		}));
	}
}

// Configura a apresentação da linha para um determinado sentido
function setCurrentSentidoAs(sentido) {
	// Permitir que o usuário alterno o sentido mesmo selecionando o já apresentado
	if (linhaPesquisada.linha.sentido == sentido) {
		sentido = (sentido == 'IDA') ? 'VOLTA' : 'IDA';
	}
	
	// Linha deve ter dois entidos, IDA e VOLTA
	if ('linhas' in linhaPesquisada && linhaPesquisada.linhas && linhaPesquisada.linhas.length == 2) {
		
		// Seleciona a linha correspondente ao sentido indicado
		var linha = linhaPesquisada.linhas.filter(function(l) {
			return l.sentido == sentido;
		})[0];
		
		if (linha != undefined) {
			setLinha(linha);
			loadHorariosSentido(linha.sentido);
			loadItinerarioSentido(linha.sentido);
			change_sentido_radio('radioSentidoContainer', linha.sentido);
		}
	}
}

// Configura o tipo de lista de linhas apresentado
function setCurrentListaLinhasAs(tipo) {
	tipoLista = tipo;
	
	change_sentido_radio('radioTipoListaLinhasContainer', tipo);
	
	M.listaLinhas[tipo].setLinhas(listaLinhas);
	M.listaLinhas[tipo].generate();
}

// Configura a apresentação da árvore horário para um determinado tipo.
function setCurrentHorarioTreeAs(tipo) {
	if (linhaPesquisada.linha) {
		change_sentido_radio('radioTipoArvoreHorariaContainer', tipo);
		isHorizontalHorarioTree = (tipo === 'horizontal');
		
		loadHorariosSentido(linhaPesquisada.linha.sentido);
	}
}

// Mostra/oculta a visibilidade do botão volta
function enableBtnVoltar(enable) {
	if (enable) {
		$('#top_btn_voltar').fadeIn();
	} else {
		$('#top_btn_voltar').fadeOut();
	}
}

// Clique no botão voltar
function onClickBtnVoltar(e) {
	if (e) {
		e.preventDefault();
	}

	window.history.back();
}

// Alterna o radio button do sentido da linha
function change_sentido_radio(radioContainer, value) {
	$radios = $('#' + radioContainer).find('.radio_sentido');
	$labels = $('#' + radioContainer).find('.label_sentido_radio');

	if ($radios[0].value == value) {
		$($labels[0]).removeClass('label_btn_sentido_unchecked_left').addClass('label_btn_sentido_checked_left');
		$($labels[1]).removeClass('label_btn_sentido_checked_right').addClass('label_btn_sentido_unchecked_right');
	} else if ($radios[1].value == value) {
		$($labels[0]).removeClass('label_btn_sentido_checked_left').addClass('label_btn_sentido_unchecked_left');
		$($labels[1]).removeClass('label_btn_sentido_unchecked_right').addClass('label_btn_sentido_checked_right');
	} else {
		$($labels[0]).removeClass('label_btn_sentido_checked_left').addClass('label_btn_sentido_unchecked_left');
		$($labels[1]).removeClass('label_btn_sentido_checked_right').addClass('label_btn_sentido_unchecked_right');
	}
}

// Abre uma div do formulário de pesquisa enquanto oculta as restantes.
function abre_formulario(evt, divId) {
	if (evt) {
		evt.preventDefault();
	}

	$('#btnContato').fadeOut('fast');
	$('#labelVersao').hide();
	$('#btnOnlineMarker').hide();
	
	DIVS_CAIXA_FORMULARIO.forEach(function(divForm) {
		if (divId == divForm) {
			display_div(divForm, "block");
			
			if (divId != 'form_parada') {
				//display_div('mapa-parada', 'none');
			} else {
				if (!isMapaPesquisaLoaded) {
					loadParadas();
					isMapaPesquisaLoaded = true;
				}

				// Scroll bottom ao abrir mapa 
				document.body.scrollTop = document.body.scrollHeight;
			}
			
			setRadioGroupValue(document.formPesq.opcao, divId);
		} else {
			display_div(divForm, "none");
		}
	});
	
	$('.form_menu_tab_active').removeClass('form_menu_tab_active');
	$(evt.currentTarget).addClass('form_menu_tab_active');
}

// Altera a visibilidade de um componente
function display_div(divId, divDisplay) {
	var sDiv = document.getElementById(divId);
	if (sDiv) {
		sDiv.style.display = divDisplay;
	}
}

// Realiza o speak de um texto.
function speech(texto, onEnd, onStart) {
	responsiveVoice.speak(texto, 'Brazilian Portuguese Female', {
		onstart: function() {
			if (onStart) {
				onStart();
			}
		},
    	onend: function() {
			$('.btn_speak_playing').removeClass('btn_speak_playing');
			if (onEnd) {
				onEnd();
			}
    	}
	});
}

// Interrompe um discurso em adamento
function speechStop() {
	if (responsiveVoice.isPlaying()) {
		responsiveVoice.cancel();
		$('.btn_speak_playing').removeClass('btn_speak_playing');
	}
}

// Requisita a localização do usuário no mapa paradas
function requestLocationMapaParadas(evt) {
	if (evt) {
		evt.preventDefault();
	}

	mapaParadas.requestLocation();
}

// Requisita a localização do usuário no mapa de percurso
function requestLocationMapaPercurso(evt) {
	if (evt) {
		evt.preventDefault();
	}

	mapaPercurso.requestLocation();
}

// Requisita a localização do usuário
function requestLocation(onSucceed, hideNotification) {
	var showMessages = hideNotification == undefined || hideNotification == false;

	if (navigator.geolocation) {
		if (showMessages) {
			M.messages.showInfo("Localização requisitada...");
		}

		$('.mapa_btn_locate').hide();

        navigator.geolocation.getCurrentPosition(function(position) {

        	postLocation(position);

        	$('.mapa_btn_locate').show();
        	onSucceed(position);

        }, function(error) {
        	$('.mapa_btn_locate').show();

        	if (showMessages) {
				switch(error.code) {
			        //case error.PERMISSION_DENIED:
			        case error.POSITION_UNAVAILABLE:
			            M.messages.showError("Localização não disponível.");
			            break;
			        case error.TIMEOUT:
			            M.messages.showError("Tempo máximo excedido de consulta da localização.");
			            break;
			        case error.UNKNOWN_ERROR:
			        	M.messages.showError("Erro ao consultar localização.");
			    }
			}
        });
    }
}


// Reconhecedor de voz
function Recognizer() {
	var self = this;

	this.recognizer = new window.SpeechRecognition();
	//this.recognizer.continuous = true;
	self.continuous = true;
	this.recognizer.onerror = function(error) {
		if (self.onError) {
			self.onError(error);
		} else {
			if (self.continuous && error.error == 'no-speech') {
				return;
			}
			
			if (error.error == 'network') {
				M.messages.showError('Erro de conexão ao reconhecer voz.');
			} else {
				M.messages.showError('Erro ao reconhecer voz: ' +  error.error);
			}
		}
	};
	this.recognizer.onend = function() {
		if (self.continuous && self.running) {
			self.recognizer.start();
		} else {
			if (self.onEnd) {
				self.onEnd();
			} else {
				M.messages.showInfo('Reconhecimento de voz encerrado.');
			}
		}

		self.running = false;
	};
	this.recognizer.onstart = function() {
		self.running = true;
		if (self.onStart) {
			self.onStart();
		}
	};
	this.recognizer.onresult = function(event) {
		if (self.onResult) {		
			var transcription = '';
			var confidence;

			for (var i = event.resultIndex; i < event.results.length; i++) {
				if (event.results[i].isFinal) {
					transcription = event.results[i][0].transcript;
					confidence = event.results[i][0].confidence;
				} else {
					transcription += event.results[i][0].transcript;
				}
			}

			self.onResult(transcription, confidence);
		}
	};

	this.start = function() {
		try {
			self.recognizer.start();
		} catch(ex) {
			if (self.onError) {
				self.onError(ex.message);
			}
		}
	};
	this.stop = function() {
		self.running = false;
		self.continuous  = false;
		self.recognizer.stop();
	};
}

// Inicializa o reconhecedor de voz
function initSpeechRecognizer(evt) {
	if (evt) {
		evt.preventDefault();
	}
	
	if (recognizer && recognizer.running) {
		recognizer.stop();
	} else {
		speechPesquisaComando();
		recognizer = new Recognizer();
		recognizer.onEnd = function() {
			changeFormSpeechImg('img/mic_empty.png');
			$('#btnRecOn').hide();
			isSpeech = false;
			M.messages.speak = undefined;
			speechStop();
		};
		recognizer.onStart = function() {
			changeFormSpeechImg('img/mic_rec.png');
			$('#btnRecOn').show();
		};
		recognizer.onResult = function(transcription, confidence) {
			isSpeech = true;
			M.voicecontroller[window.location.hash].onResult(transcription, confidence);
		};
		
		try {
			recognizer.start();
			M.messages.speak = speech;
		} catch(err) {
			M.messages.showError('Erro ao iniciar reconhecimento de voz: ' +  err);
		}
	}
}


// Realiza o speak das linhas apresentadas na lista de linhas
function speechListagemCurrentLista() {
	var linhas = currentListaLinhas;
	var texto;

	if (linhas.length == 0) {
		texto = 'Nenhuma linha para ser listada. ';
	} else {
		texto = 'Listagem para ' + linhas.length + ' linhas. ';

		linhas.forEach(function(linha) {
			texto += linha.speechText();
		});
	}

	speech(texto);
}

// Realiza o speak dos comandos da pesquisa de linhas
function speechPesquisaComando() {
	var texto = 'Diga "linha", seguindo do número da linha para consultar a mesma. ';
	texto += 'Diga no formato "origem" lugar A, "destino" lugar B, para consulta de linhas por referência.';
	
	speech(texto);
}

// Realiza o speak dos comandos da apresentação de linha
function speechLinhaComando() {
	var texto = 'Diga "resumo horário" para obter um resumo dos dias de operação, ';
	texto += '"resumo itinerário", para obter um resumo do trajeto, ';
	texto += '"horário", seguido de um dia da semana para obter suas respectivas partidas, ';
	texto += '"sentido", seguido do sentido ida ou volta que deseja definir.';
	
	speech(texto);
}

// Realiza o speak dos comandos da lista de linhas
function speechListaLinhasComando() {
	var texto = 'Diga "listagem", para obter a audiodescrição da lista. ';
	texto += 'Diga "quantidade" para obter a quantidade de linhas da lista. '
	texto += 'Diga "filtrar por", seguido de uma expressão para realizar um filtro. ';
	texto += 'Ou diga "linha", seguindo do número da linha que deseja consultar.';

	speech(texto);	
}

// Realiza o speak da quantidade de linhas na lista.
function speechListaLinhasQuantidade() {
	var qtd = currentListaLinhas ? currentListaLinhas.length : 0;

	var texto = 'Quantidade de linhas: ' + qtd + '. ';

	speech(texto);
}

// Realiza o speak da linha apresentada.
function speechResumoLinha() {
	if (linhaPesquisada.linha) {
		var linha = linhaPesquisada.linha;
	
		var texto = 'Linha número ';
		if (linha.numero.indexOf('.') != -1) {
			texto += linha.numero.split('.')[0] + ' ponto ' + linha.numero.split('.')[1];
		} else {
			texto += linha.numero;
		}
		texto += '. ';
		texto += linha.descricao + '. ';
		texto += 'Sentido ' + linha.sentido + '. ';
		if (linha.faixaTarifaria) {
			var tarifa = linha.faixaTarifaria.tarifa.toString();
			texto += 'Tarifa ';
			
			if (tarifa.toString().indexOf('.') != -1) {
				texto += tarifa.split('.')[0] + ' vírgula ' + tarifa.split('.')[1];
			} else {
				texto += tarifa;
			}
			
			texto += ' reais.';
		}
		
		display_div('info_itinerario', 'none');
		display_div('info_horario', 'none');
		
		speech(texto);
	}
}

// Realiza o speak do resumo horário.
function speechResumoHorario() {
	if (linhaPesquisada.linha) {		
		var texto = '';
		
		var sentido = getText('resumoHorarioSentido');
		if (sentido) {
			texto += 'Sentido: ' + sentido + '. ';
		}
				
		var dias = getText('resumoHorarioDias');
		if (dias) {
			texto += 'Dias:';
			DIAS_SEMANA.forEach(function(dia) {
				if (dias.indexOf(dia.substring(0, 3)) != -1) {
					texto += ' ' + dia + ',';
				}
			});
			texto = texto.substring(0, texto.length - 1) + '. ';
		}
		
		var partidas = getText('resumoHorarioPartidas');
		if (partidas) {
			texto += 'Número de viagens: ' + partidas + '. ';
		}
		
		var duracao = getText('resumoHorarioTempoMedio');
		if (duracao) {
			texto += 'Duração média da viagem: ';
			
			var split = duracao.split(':');
			
			var hora = parseInt(split[0]);
			var minutos = parseInt(split[1]);
			
			if (hora > 0) {
				if (hora > 1) {
					texto += hora + ' horas';
				} else {
					texto += 'uma hora';
				}
				
				texto += ' e ';
			}
			
			if (minutos > 0) {
				if (minutos == 1) {
					texto += 'um minuto'; 
				} else if (minutos > 1) {
					texto += minutos + ' minutos'
				}
			}
			
			texto += '.'
		}
		
		if (texto.length == 0) {
			texto = 'Por favor, pesquise uma linha primeiro.';
		} else {
			texto = 'Resumo horário. ' + texto;
		}
		
		speech(texto);
	}
}

// Realiza o speak do resumo de itinerário.
function speechResumoItinerario() {
	if (linhaPesquisada.linha) {
		var texto = '';
		
		var sentido = getText('resumoHorarioSentido');
		if (sentido) {
			texto += 'Sentido: ' + sentido + '. ';
		}
		
		if (sentido != 'CIRCULAR') {
			var origem = getText('resumoItinerarioOrigem');
			if (origem) {
				texto += 'Ponto de origem: ' + origem + '. ';
			}
		
			var destino = getText('resumoItinerarioDestino');
			if (destino) {
				texto += 'Ponto de destino: ' + destino + '. ';
			}
		}
		
		var extensao = getText('resumoItinerarioExtensao');
		if (extensao) {
			extensao = extensao.substring(0, extensao.indexOf(' km'));
			
			texto += 'Extensão: ';
			
			if (extensao.indexOf('.') != -1) {
				texto += extensao.split('.')[0] + ' vírgula ' + extensao.split('.')[1];
			} else {
				texto += extensao;
			}
			
			texto += ' quilômetros. ';
		}
		
		var trechos = getText('resumoItinerarioTrechos');
		if (trechos) {
			texto += 'Quantidade de trechos: ' + trechos + '.';
		}
		
		if (texto.length == 0) {
			texto = 'Por favor, pesquise uma linha primeiro.';
		} else {
			texto = 'Resumo do itinerário. ' + texto;
		}
		
		speech(texto);
	}
}

// Realiza o speak dos horários de uma linha
function speechHorarios(diaSemana) {
	var sentido = linhaPesquisada.horarios.filter(function(horario) {
		return horario.label = linhaPesquisada.linha.sentido;
	})[0];
	
	var texto = '';
		
	if (sentido) {
		sentido.diasSemana.forEach(function(dia) {
			if (dia.count > 0  && (diaSemana == undefined  || dia.label == diaSemana)) {
				texto += dia.label + ': ';
				
				dia.turnos.forEach(function(turno) {
					if (turno.horarios.length > 0) {
						texto += turno.label + (turno.horarios.length > 0 ? ', partidas às ' : ', partida às ');
						
						turno.horarios.forEach(function(horario) {
							var horario = horario.horario;
							
							if (horario.startsWith('0')) {
								horario = horario.substring(1);
							}
							
							horario = horario.split(':');
							
							if (horario[1] == '00') {
								texto += horario[0] + ' horas, ';
							} else {
								texto += (horario[0] == '1' ? 'uma' : horario[0]) + ' e ' + horario[1] + ', ';
							}
						});
						
						if (texto.endsWith(', ')) {
							texto = texto.substring(0, texto.length - 2);
						}
						
						texto += '. ';
					}
				});
			}
		});
	} else {
		texto = 'Nenhuma partida.';
	}
	
	showHorariosLinha();
	
	speech(texto);
}

// Realiza o speak do itinerário descritivo da linha
function speechItinerario() {	
	var sentido = linhaPesquisada.itinerarios.filter(function(itinerario) {
		return itinerario.sentido = linhaPesquisada.linha.sentido;
	})[0];
	
	var texto = '';
		
	if (sentido) {
		sentido.itinerario.forEach(function(it) {
			texto += 'Trexo ' + it.sequencial + ', ' + it.via + '. ';
		});
	} else {
		texto = 'Nenhum itinerário.';
	}
	
	showItinerarioLinha();
	
	speech(texto);
}

// Altera a imagem do formulário de speech.
function changeFormSpeechImg(src) {
	$('#form_speech > a > img').attr('src', src);
}

// Apresenta a página de contato
function showContatoPage(evt) {
	if (evt) {
		evt.preventDefault();
	}

	render('#contato');
}

// Abre ou recolhe o painel de diálogo do mapa de parada
function toggleMapParadaDialog(evt) {
	if (evt) {
		evt.preventDefault();
	}

	var $dialog = $('#mapa-parada-dialogo');

	if ($dialog.is(':visible')) {	// Ocultar mapa
		$dialog.animate({width: 'hide'}, 200, 'linear');
		$('#btnShowMapDialog').animate({width: 'show'}, 200, 'linear');
	} else {
		$dialog.animate({width: 'show'}, 200, 'linear');
		$('#btnShowMapDialog').animate({width: 'hide'}, 200, 'linear');
	}
}

// Abre ou recolhe o painel de diálogo do mapa de parada
function togglePanelLegendaParada(evt) {
	if (evt) {
		evt.preventDefault();
	}

	$('#mapa-parada-legend-btn').animate({width: 'toggle'}, 200, 'linear');
}

// Abre ou recolhe o painel de diálogo do mapa de percurso
function togglePanelLegendaLinha(evt) {
	if (evt) {
		evt.preventDefault();
	}

	$('#mapa-linha-legend-btn').animate({width: 'toggle'}, 200, 'linear');
}

// Controla a visibilidade da comada de paradas do mapa de percurso
function toggleParadasLayerMapaPercurso(evt) {
	mapaPercurso.toggleParadasLayerVisibility();
}

// Controla a visibilidade do painel de veículos
function togglePanelVeiculos(evt) {
	if (evt) {
		evt.preventDefault();
	}

	var $panel = $('#mapa-linha-veiculos-btn');

	if (!$panel.is(':visible')) {
		
	}

	$panel.animate({width: 'toggle'}, 200, 'linear');
}

// Mostra o switcher de origem/destino do mapa de paradas
function showParadaSwitch() {
	$('#paradaSwitch').fadeIn('fast');
}

// Ação do botão logo
function onBtnTop(event) {
	if (event) {
		event.preventDefault();
	}

	window.history.back();
}

// Produz a ID do usuário
function generateUserId() {
	var id = localStorage.getItem('user_id');

	if (id == null) {
		id = generateRandomStr(10);
		localStorage.setItem('user_id', id);
	}

	return id;
}

// Aciona a impressão de página
function printPage(event) {
	event.preventDefault();

	window.print();
}

// Mostra o mapa de pesquisa
/*function toggleMapParada(evt) {
	if (evt) {
		evt.preventDefault();
	}

	var $map = $('#mapa-parada');
	
	if ($map.is(':visible')) {	// Ocultar mapa
		$map.animate({width: 'toggle'}, 200, 'linear');
		
		// Transfere valor dos campos do formulário para os campos do mapa
		$('#paradaOrigem').val($('#paradaOrigemMapa').val());
		$('#paradaDestino').val($('#paradaDestinoMapa').val());
	} else {	// Abrir mapa
		if (!isMapaPesquisaLoaded) {
			// Mapa não carregado; ao final da animação carrega-lo
			$map.animate({width: 'toggle'}, 200, 'linear', function() {
				// Inicializa o mapa e carrega as paradas
				loadParadas();
				isMapaPesquisaLoaded = true;
			});
		} else {
			$map.animate({width: 'toggle'}, 200, 'linear');
		}

		// Transfere valor dos campos do mapa para os campos do formulário
		$('#paradaOrigemMapa').val($('#paradaOrigem').val());
		$('#paradaDestinoMapa').val($('#paradaDestino').val());
	}	
}

// Pesquisar as regiões administrativas para a consulta por cidade
function pesquisarRegioes() {
	if (!isRegioesLoaded) {
		M.loading.showTop();
		
		$.get(WEB_SERVICE_PROTOCOL + WEB_SERVICE_SERVER + '/regiao/regioes', function(data, status) {
			if (status == 'success') {
				setRegioes(data);
			} else {
				console.log('<!> consulta de regioes nao sucedida: ' + status);
				M.messages.showWarn('<!> consulta de cidades não sucedida.');
			}
		}).fail(function() {
			M.messages.showError('<#> erro de conexao ao consultar cidades :(');
    		console.log('<#> erro ao carregar regioes.');
  		}).complete(function() {
			M.loading.hideTop();
		});
	}
}


// Configura um conjunto de opções para um conjunto de <select>s, dado um mapa de chave-valor
function setSelectsOptions(mapaOpcoes, selects) {
	function getOption(valor, label) {
		var opt = document.createElement('option');
		opt.value = valor;
		opt.innerHTML = label;
		return opt;
	}
	
	// Ordenação
	var entries = Object.entries(mapaOpcoes);
	['a', 'b'].sort(function(entrie1, entrie2) {
		return entrie1.localeCompare(entrie2);
	});
	
	entries.forEach(function([key, value]) {
		Array.prototype.forEach.call(selects, function(select) {
			select.appendChild(getOption(key, value));
		});
	});
}

// Configura a lista de regiões.
function setRegioes(regioes) {
	if (regioes) {
		var divFormCidade = document.getElementById('form_cidade');
		var selects = divFormCidade.getElementsByClassName("form_select");
		
		var mapa = {};
		regioes.forEach(function(regiao) {
			mapa[regiao.sequencial + ''] = regiao.descricao;
		});
		
		setSelectsOptions(mapa, selects);
		
		isRegioesLoaded = true;
	} else {
		console.log('<!> pesquisa de regioes com retorno vazio.');
		M.messages.showWarn('<!> nenhuma cidade.');
	}
}
*/


}
