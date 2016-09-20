angular.module('prosePair').directive('dialogDirective', function() {
  return {
    restrict: 'E',
    scope: {
      show: '='
    },
    replace: true, 
    transclude: true, 
    link: function(scope, element, attrs) {
      scope.dialogStyle = {};

      attrs.$observe('width', function(newVAl){
        if (attrs.width){
          scope.dialogStyle.width = attrs.width;
        }
      });

      attrs.$observe('height', function(newVAl){
        if (attrs.height){
          scope.dialogStyle.height = attrs.height;
        }
      });
     
      scope.hideModal = function() {
        scope.show = false;
      };
    },
    templateUrl: 'angular/templates/popUpModal.html'
  };
});