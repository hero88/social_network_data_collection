/**
 * New node file
 */
var myApp = angular.module('myApp', []);

function mainController($scope, $http) 
{
	$scope.formData = {};        

	// when landing on the page, get all info and show them
	$http.get('/api/fbdata')
		.success(function(data) 
		{
			$scope.pageData= data;
			console.log(data);
		})
		.error(function(data) 
		{
			console.log('Error: ' + data);
		});

	// when submitting the add form, send the text to the node API
	$scope.createTodo = function() 
	{
            FB.api(
                "/me/friends",
                function (response) {
                  if (response && !response.error) {
                    /* handle the result */
                    console.log('abc'+response);
                    
                  }
                }
            );
		$http.post('/api/fbdata', $scope.formData)
			.success(function(data) 
			{
				$scope.formData = {}; // clear the form so our user is ready to enter another
				$scope.pageData = data;				
				console.log(data);
			})
			.error(function(data) 
			{
				console.log('Error: ' + data);
			});
	};
	
	// delete a todo after checking it
    $scope.deleteTodo = function(id) {
        $http.delete('/api/fbdata/' + id)
            .success(function(data) {
                $scope.pageData = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };
}
