#include <cstdlib>
#include <cstdio>
#include <ctime>

int main(){
	int a = 0;
	srand(time(0));
	printf("%d\n", RAND_MAX);
	while(true){
		scanf("%d", &a);
		printf("%d\n", rand() % a + 1);
	}
}