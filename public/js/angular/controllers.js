angular
  .module('webmakerApp')
  .controller('navigationController', ['$scope', '$location', '$routeParams', '$rootScope', 'weblit', 'wmNav', 'CONFIG',
    function ($scope, $location, $routeParams, $rootScope, weblit, wmNav, config) {
      // Nav data
      $scope.nav = {
        sections: [
          {
            id: 'explore',
            url: 'explore',
            title: 'Explore',
            icon: 'random',
            pushState: true,
            pages: [
              {
                "id": "index",
                "title": "Gallery",
                "url": "gallery"
              },
              {
                id: 'super-mentor',
                title: 'Super Mentor Badge',
                url: 'badges/webmaker-super-mentor'
              },
              {
                id: 'super-mentor',
                title: 'Hive Community Badge',
                url: 'badges/hive-community-member'
              },
              {
                id: 'badges-admin',
                title: 'Badges Admin',
                url: 'admin/badges',
                pushState: true,
                isAtleastMentor: true
              },
              {
                id: 'search',
                title: 'Search',
                url: 'search'
              }
            ]
          },
          {
            id: 'tools',
            url: 'tools',
            title: 'Tools',
            icon: 'hand-o-up'
          },
          {
            id: 'resources',
            title: 'Resources',
            icon: 'book',
            pushState: true,
            dropdown: true
          },
          {
            id: 'events',
            url: 'events',
            title: 'Events',
            icon: 'map-marker'
          },
          {
            id: 'info',
            url: 'about',
            title: 'Info',
            icon: 'info'
          }
        ]
      };

      // User urls
      $scope.accountSettingsUrl = config.accountSettingsUrl;

      // Start with collapsed state for navigation
      $scope.primaryCollapse = true;
      $scope.secondaryCollapse = true;
      $scope.tertiaryCollapse = true;
      $scope.mobileCollapse = true;

      $scope.collapseToggle = function () {
        $scope.primaryCollapse = !$scope.primaryCollapse;
        $scope.secondaryCollapse = !$scope.secondaryCollapse;
        $scope.tertiaryCollapse = !$scope.tertiaryCollapse;
      };

      $scope.weblitToggle = function () {
        $scope.mobileCollapse = !$scope.mobileCollapse;
      };

      $rootScope.$on('$locationChangeSuccess', function (event) {
        $scope.primaryCollapse = true;
        $scope.secondaryCollapse = true;
        $scope.tertiaryCollapse = true;
        $scope.mobileCollapse = true;
      });

      $scope.clickedResource = false;
      $scope.literacies = weblit.all();

      $scope.page = wmNav.page;
      $scope.section = wmNav.section;

      $scope.isActivePage = function (page) {
        return page === wmNav.page();
      };

      $scope.isActiveSection = function (section) {
        return section === wmNav.section();
      };

    }
  ])
  .controller('exploreController', ['$scope', 'CONFIG', 'wmNav',
    function ($scope, CONFIG, wmNav) {
      wmNav.page('explore');
      wmNav.section('explore');

      $scope.contributeBoxes = [
        {
          icon: 'book',
          title: 'Teaching kits',
          description: 'Teaching kits desc',
          target: '/' + CONFIG.lang + '/teach-templates'
        },
        {
          icon: 'map-marker',
          title: 'Events',
          description: 'Events desc',
          target: 'https://events.webmaker.org/' + CONFIG.lang
        },
        {
          icon: 'globe',
          title: 'Translate',
          description: 'Translate desc',
          target: 'https://support.mozilla.org/' + CONFIG.lang + '/kb/translate-webmaker'
        },
        {
          icon: 'picture-o',
          title: 'Design',
          description: 'Design desc',
          target: 'https://wiki.mozilla.org/Webmaker/Design'
        },
        {
          icon: 'code',
          title: 'Code',
          description: 'Code desc',
          target: 'https://support.mozilla.org/' + CONFIG.lang + '/kb/contribute-webmaker-code'
        },
        {
          icon: 'rocket',
          title: 'Partner',
          description: 'Partner desc',
          target: 'http://party.webmaker.org/' + CONFIG.lang + '/partners'
        }
      ];
    }
  ])
  .controller('homeController', ['$scope', 'wmNav',
    function ($scope, wmNav) {
      wmNav.page('home');
      wmNav.section('');
    }
  ])
  .controller('competencyController', ['$rootScope', '$scope', '$location', '$routeParams', 'weblit', 'CONFIG', '$timeout', 'wmNav',
    function ($rootScope, $scope, $location, $routeParams, weblit, CONFIG, $timeout, wmNav) {
      wmNav.page($routeParams.id);
      wmNav.section('resources');

      $scope.tag = $routeParams.id;

      $scope.skill = weblit.all().filter(function (item) {
        return item.tag === $scope.tag;
      })[0];

      if ($rootScope.contentReady) {
        $scope.content = $rootScope.content[$scope.tag];
      } else {
        $timeout(function () {
          $scope.content = $rootScope.content[$scope.tag];
        }, 500);
      }
      $scope.weblit = weblit;

      $scope.wlcPoints = CONFIG.wlcPoints;

    }
  ])
  .controller('resourceFormController', ['$scope', '$http', 'wmAnalytics',
    function ($scope, $http, analytics) {
      $scope.formData = {};
      $scope.submit = function (form) {

        var data = $scope.formData;
        data.username = $scope._user.username;
        data.email = $scope._user.email;
        data.webliteracy = $scope.skill.term;

        $http
          .post('/api/submit-resource', data)
          .success(function (ok) {
            if (ok) {
              $scope.success = true;
              $scope.formData = {};
              analytics.event('Suggested Web Literacy Resource');
            }
          })
          .error(function (err) {
            console.log(err);
          });
      };
    }
  ])
  .controller('resourcesHomeController', ['$scope', 'weblit', 'wmNav',
    function ($scope, weblit, wmNav) {
      wmNav.page('resources');
      wmNav.section('resources');

      $scope.literacies = weblit.all();
    }
  ])
  .controller('mwcController', ['$rootScope', '$scope', '$routeParams', '$timeout', 'wmNav',
    function ($rootScope, $scope, $routeParams, $timeout, wmNav) {
      wmNav.section('resources');
      wmNav.page('');

      $scope.page = $routeParams.mwc;

      // Keeps controller operations in one function to be fired when $rootScope is ready

      function init() {
        $scope.madewithcode = $rootScope.madewithcode[$scope.page];

      }

      // Don't fire controller until after $rootScope is ready
      if ($rootScope.mwcReady) {
        init();
      } else {
        $timeout(function () {
          init();
        }, 500);
      }
    }
  ])
  .controller('badgesAdminController', ['$rootScope', '$scope', '$http', 'wmNav',
    function ($rootScope, $scope, $http, wmNav) {
      wmNav.page('badges-admin');
      wmNav.section('explore');

      $scope.badges = [];
      $scope.hasPermissions = function (badge) {
        return window.badgesPermissionsModel({
          badge: badge,
          user: $rootScope._user,
          action: 'applications'
        });
      };

      $http
        .get('/api/badges')
        .success(function (badges) {
          $scope.badges = badges;
        });
    }
  ])
  .controller('badgesAdminBadgeController', ['$scope', '$http', '$window', '$routeParams', '$modal', 'wmNav',
    function ($scope, $http, $window, $routeParams, $modal, wmNav) {
      wmNav.page('badges-admin');
      wmNav.section('explore');

      var currentBadge = $routeParams.badge;

      $scope.badge = {};
      $scope.instances = [];
      $scope.badgesError = false;

      // Error handling

      function onError(err) {
        $scope.badgesError = err.error;
        console.log(err);
      }

      // This issues a new badge
      $scope.issueBadge = function (email) {
        $http
          .post('/api/badges/' + currentBadge + '/issue', {
            email: email
          })
          .success(function (data) {
            $scope.badgesError = false;
            $scope.instances.unshift(data);
            $scope.issueEmail = '';
          })
          .error(onError);
      };

      // This revokes badges
      $scope.revokeBadge = function (email) {
        var ok = $window.confirm('Are you sure you want to delete ' + email + "'s badge?");
        if (ok) {
          $http
            .delete('/api/badges/' + currentBadge + '/instance/email/' + email)
            .success(function () {
              for (var i = 0; i < $scope.instances.length; i++) {
                if ($scope.instances[i].email === email) {
                  $scope.instances.splice(i, 1);
                }
              }
            })
            .error(onError);
        }
      };

      // This opens the review application dialog
      $scope.reviewApplication = function reviewApplication(application) {
        $modal.open({
          templateUrl: '/views/partials/review-application-modal.html',
          resolve: {
            application: function () {
              return application;
            }
          },
          controller: ReviewApplicationController
        }).result.then(function (review) {
          $http
            .post('/api/badges/' + currentBadge + '/applications/' + review.id + '/review', {
              comment: review.comment,
              reviewItems: createReviewItems(review.decision)
            })
            .success(function () {
              for (var i = 0; i < $scope.applications.length; i++) {
                if ($scope.applications[i].slug === review.id) {
                  $scope.applications.splice(i, 1);
                }
              }
            })
            .error(onError);
        });
      };

      // Allows all criteria to be satisfied/not satisfied based on single decision

      function createReviewItems(decision) {
        var criteria = $scope.badge.criteria;
        var reviewItems = [];
        // true not allowed due to bug 1021186
        var satisfied = decision === 'yes';

        criteria.forEach(function (item) {
          reviewItems.push({
            criterionId: item.id,
            satisfied: satisfied,
            comment: ''
          });
        });

        return reviewItems;
      }

      var ReviewApplicationController = function ($scope, $modalInstance, application) {
        $scope.review = {
          id: application.slug,
          email: application.learner
        };
        $scope.application = application;
        $scope.ok = function () {
          $modalInstance.close($scope.review);
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      };

      // On load, Get all instances
      $http
        .get('/api/badges/' + currentBadge + '/instances')
        .success(function (data) {
          $scope.instances = data.instances;
          $scope.badge = data.badge;
        })
        .error(onError);

      // Also get applications
      $http
        .get('/api/badges/' + currentBadge + '/applications')
        .success(function (data) {
          $scope.applications = data;
        })
        .error(onError);
    }
  ]);
